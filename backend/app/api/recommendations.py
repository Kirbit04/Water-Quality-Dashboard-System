import logging
from fastapi import APIRouter, HTTPException, BackgroundTasks

from ..ml.pipeline.processor import WaterQualityProcessor
from ..core.database import get_db_instance

log = logging.getLogger(__name__)
_processor = WaterQualityProcessor()


class RecommendationsRouter: 

    def __init__(self):
        self.router = APIRouter(
            prefix="/recommendations",
            tags=["Recommendations"],
        )
        self._register_routes()

    def _register_routes(self):
        self.router.add_api_route(
            path="/lab-test/{test_id}/process",
            endpoint=self.process_lab_test,
            methods=["POST"],
            summary="Trigger pipeline for a specific test (async)",
        )
        self.router.add_api_route(
            path="/lab-test/{test_id}/process/sync",
            endpoint=self.process_lab_test_sync,
            methods=["POST"],
            summary="Trigger pipeline and wait for results (sync)",
        )
        self.router.add_api_route(
            path="/process-pending",
            endpoint=self.process_pending,
            methods=["POST"],
            summary="Process all unprocessed lab tests",
        )
        self.router.add_api_route(
            path="/lab-test/{test_id}/results",
            endpoint=self.get_results,
            methods=["GET"],
            summary="Fetch stored results and recommendations for a test",
        )


    def _run_in_background(self, test_id: int):
        #Fetches the lab test row and runs the full pipeline.
        try:
            row = _processor.fetch_test_by_id(test_id)
            if row:
                _processor.process_test(row)
        except Exception as e:
            log.error(f"Background processing failed for test_id={test_id}: {e}")

    def _fetch_model_result(self, cursor, test_id: int) -> dict:
        #Fetches the model result joined with lab_tests data.
        cursor.execute("""
            SELECT mr.*, lt.ph, lt.turbidity, lt.dissolved_oxygen,
                   lt.nitrates, lt.phosphates, lt.salinity,
                   lt.user_id, lt.location_id, lt.date_of_test, lt.occupation
            FROM   model_results mr
            JOIN   lab_tests lt ON lt.test_id = mr.test_id
            WHERE  mr.test_id = %s
        """, (test_id,))
        rows = cursor.fetchall()
        return rows[0] if rows else None

    def _fetch_recommendations(self, cursor, result_id: int) -> list:
        #Fetches recommendations ordered by severity level.
        cursor.execute("""
            SELECT recommendation_id, recommendation_text,
                   recommendation_type, severity_level, generated_at
            FROM   recommendations
            WHERE  result_id = %s
            ORDER BY
                CASE severity_level
                    WHEN 'Critical' THEN 1
                    WHEN 'High'     THEN 2
                    WHEN 'Moderate' THEN 3
                    ELSE 4
                END
        """, (result_id,))
        return cursor.fetchall()

    def _format_result_response(self, test_id: int, result: dict, recommendations: list) -> dict:
        #Formats the final API response dict with all relevant data.
        return {
            "test_id":       test_id,
            "result_id":     result["result_id"],
            "wqi_score":     result["wqi_score"],
            "health_score":  result["health_score"],
            "risk_level":    result["risk_level"],
            "ml_confidence": result.get("ml_confidence"),
            "analysis_date": str(result["analysis_date"]),
            "parameters": {
                "ph":               result["ph"],
                "turbidity":        result["turbidity"],
                "dissolved_oxygen": result["dissolved_oxygen"],
                "nitrates":         result["nitrates"],
                "phosphates":       result["phosphates"],
                "salinity":         result["salinity"],
            },
            "user_id":    result["user_id"],
            "occupation": result["occupation"],
            "recommendations": [
                {
                    "id":                  r["recommendation_id"],
                    "recommendation_text": r["recommendation_text"],
                    "recommendation_type": r["recommendation_type"],
                    "severity_level":      r["severity_level"],
                    "generated_at":        str(r["generated_at"]),
                }
                for r in recommendations
            ],
        }


    async def process_lab_test(self, test_id: int, background_tasks: BackgroundTasks):
        #Triggers the recommendation pipeline for a specific lab test immediately after insertion.
        row = _processor.fetch_test_by_id(test_id)
        if not row:
            raise HTTPException(status_code=404, detail=f"lab_test {test_id} not found.")

        if _processor.result_exists(test_id):
            return {
                "test_id": test_id,
                "status":  "already_processed",
                "message": "Results already exist for this test.",
            }

        background_tasks.add_task(self._run_in_background, test_id)
        return {
            "test_id": test_id,
            "status":  "processing",
            "message": "Pipeline triggered. Results will be available shortly.",
        }

    async def process_lab_test_sync(self, test_id: int):
        #Triggers the recommendation pipeline and waits for results before responding.
        row = _processor.fetch_test_by_id(test_id)
        if not row:
            raise HTTPException(status_code=404, detail=f"lab_test {test_id} not found.")

        try:
            return _processor.process_test(row)
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def process_pending(self):
        #Processes all pending lab tests that haven't been processed yet.
        try:
            results = _processor.process_all_pending()
            return {
                "total":     len(results),
                "processed": sum(1 for r in results if r["status"] == "processed"),
                "errors":    sum(1 for r in results if r["status"] == "error"),
                "details":   results,
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    async def get_results(self, test_id: int):
        db = get_db_instance()

        with db.get_cursor() as cursor:
            result = self._fetch_model_result(cursor, test_id)
            if not result:
                raise HTTPException(
                    status_code=404,
                    detail=f"No results for test_id={test_id}. "
                        f"Try POST /recommendations/lab-test/{test_id}/process first."
                )
        with db.get_cursor() as cursor:
            recommendations = self._fetch_recommendations(cursor, result["result_id"])

        return self._format_result_response(test_id, result, recommendations)