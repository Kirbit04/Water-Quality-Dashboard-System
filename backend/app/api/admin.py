import logging
from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from ..core.database import get_db_instance, Database
from ..core.settings import get_settings
from ..services.repository import UserRepository, LabTestRepository
import csv, io

log = logging.getLogger(__name__)


class AdminRouter:

    def __init__(self):
        self.router = APIRouter(
            prefix="/admin",
            tags=["Admin"],
        )
        db: Database = get_db_instance()
        self._users = UserRepository(db)
        self._labtests = LabTestRepository(db)
        self._register_routes()

    # route registrations
    def _register_routes(self):
        self.router.add_api_route(
            path="/stats",
            endpoint=self.get_stats,
            methods=["GET"],
            summary="Admin dashboard aggregate stats",
        )
        self.router.add_api_route(
            path="/users",
            endpoint=self.get_users,
            methods=["GET"],
            summary="List all users",
        )
        self.router.add_api_route(
            path="/users/{user_id}",
            endpoint=self.delete_user,
            methods=["DELETE"],
            summary="Delete a user",
        )
        self.router.add_api_route(
            path="/lab_tests/{test_id}",
            endpoint=self.delete_lab_test,
            methods=["DELETE"],
            summary="Delete a lab test",
        )
        self.router.add_api_route(
            path="/model_results",
            endpoint=self.get_model_results,
            methods=["GET"],
            summary="List all model results",
        )
        self.router.add_api_route(
            path="/tests/export/csv",
            endpoint=self.export_tests_csv,
            methods=["GET"],
            summary="Export all lab test data as CSV",
        )
        self.router.add_api_route(
            path="/model_results/{result_id}",
            endpoint=self.delete_model_result,
            methods=["DELETE"],
            summary="Delete a model result and its recommendations",
        )
        self.router.add_api_route(
            path="/recommendations",
            endpoint=self.get_recommendations,
            methods=["GET"],
            summary="List all recommendations",
        )
        self.router.add_api_route(
            path="/recommendations/{recommendation_id}",
            endpoint=self.delete_recommendation,
            methods=["DELETE"],
            summary="Delete a single recommendation",
        )

    #getting stats for admin dashboard overview

    async def get_stats(self):
        #Aggregate counts for the admin dashboard overview.
        db = get_db_instance()

        total_users = self._users.count()

        with db.get_cursor() as cursor:
            cursor.execute("SELECT COUNT(*) AS total FROM lab_tests")
            total_tests = cursor.fetchall()[0]["total"]

        with db.get_cursor() as cursor:
            cursor.execute("SELECT COUNT(*) AS total FROM  model_results")
            pending = cursor.fetchall()[0]["total"]

        with db.get_cursor() as cursor:
            cursor.execute("SELECT COUNT(*) AS total FROM recommendations")
            processed = cursor.fetchall()[0]["total"]

        return {
            "totalUsers":            total_users,
            "totalTests":            total_tests,
            "totalModelResults":        pending,
            "totalRecommendations": processed,
        }
    
    #downloading lab test data as CSV
    async def export_tests_csv(self):
        with get_db_instance().get_cursor() as cursor:
            cursor.execute("""
                SELECT *
                FROM   lab_tests lt
                ORDER  BY lt.date_of_test DESC
            """)
            rows = cursor.fetchall()

        output = io.StringIO()
        if rows:
            writer = csv.DictWriter(output, fieldnames=rows[0].keys())
            writer.writeheader()
            writer.writerows(rows)

        output.seek(0)
        return Response(
            content=output.getvalue(),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=aquaguard-tests.csv"}
        )

    # getting users with pagination

    async def get_users(self, skip: int = 0, limit: int = 100):
        #list users using user repository
        users = self._users.get_all(skip=skip, limit=limit)
        return [
            {
                "id":         u.id,
                "name":       u.name,
                "email":      u.email,
                "role":       u.role,
                "is_active":  u.is_active,
                "created_at": str(u.created_at) if hasattr(u, "created_at") else None,
            }
            for u in users
        ]

    async def delete_user(self, user_id: int):
        #delete a user using UserRepository
        deleted = self._users.delete(user_id)
        if not deleted:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found.")
        return {"message": f"User {user_id} deleted successfully."}

    # deleting lab tests

    async def delete_lab_test(self, test_id: int):
        #delete a lab test using LabTestRepository
        deleted = self._labtests.delete(test_id)
        if not deleted:
            raise HTTPException(status_code=404, detail=f"Lab test {test_id} not found.")
        return {"message": f"Lab test {test_id} deleted successfully."}

    # Model Results 
    async def get_model_results(self, skip: int = 0, limit: int = 100):
        with get_db_instance().get_cursor() as cursor:
            cursor.execute("""
                SELECT mr.result_id, mr.test_id, mr.wqi_score, mr.health_score,
                       mr.risk_level, mr.ml_confidence, mr.analysis_date,
                       lt.user_id, lt.occupation, lt.date_of_test
                FROM   model_results mr
                JOIN   lab_tests lt ON lt.test_id = mr.test_id
                ORDER  BY mr.analysis_date DESC
                LIMIT  %s OFFSET %s
            """, (limit, skip))
            rows = cursor.fetchall()
        return rows

    async def delete_model_result(self, result_id: int):
        #deleting a model result and its associated recommendations
        db = get_db_instance()

        with db.get_cursor() as cursor:
            cursor.execute(
                "DELETE FROM recommendations WHERE result_id = %s", (result_id,)
            )

        with db.get_cursor() as cursor:
            cursor.execute(
                "DELETE FROM model_results WHERE result_id = %s", (result_id,)
            )
            if cursor.rowcount == 0:
                raise HTTPException(
                    status_code=404,
                    detail=f"Model result {result_id} not found."
                )

        return {"message": f"Model result {result_id} and its recommendations deleted."}

    # Working on recommendations

    async def get_recommendations(self, skip: int = 0, limit: int = 100):
        with get_db_instance().get_cursor() as cursor:
            cursor.execute("""
                SELECT r.recommendation_id, r.result_id, r.recommendation_text,
                       r.recommendation_type, r.severity_level, r.generated_at,
                       mr.test_id, mr.risk_level
                FROM   recommendations r
                JOIN   model_results mr ON mr.result_id = r.result_id
                ORDER  BY r.generated_at DESC
                LIMIT  %s OFFSET %s
            """, (limit, skip))
            rows = cursor.fetchall()
        return rows

    async def delete_recommendation(self, recommendation_id: int):
        with get_db_instance().get_cursor() as cursor:
            cursor.execute(
                "DELETE FROM recommendations WHERE recommendation_id = %s",
                (recommendation_id,)
            )
            if cursor.rowcount == 0:
                raise HTTPException(
                    status_code=404,
                    detail=f"Recommendation {recommendation_id} not found."
                )
        return {"message": f"Recommendation {recommendation_id} deleted."}