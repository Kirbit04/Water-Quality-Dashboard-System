import sys, logging
from pathlib import Path
from datetime import datetime

import numpy as np
import joblib

# Path setup for importing model artifacts and modules
BASE_DIR  = Path(__file__).parent.parent
MODEL_DIR = BASE_DIR / "model" / "artifacts"
sys.path.insert(0, str(BASE_DIR / "model"))
sys.path.insert(0, str(BASE_DIR))

from app.ml.model.wqi_engine import full_assessment
from app.ml.model.recommendation_engine import generate_recommendations
from ...core.database import get_db_instance


class WaterQualityProcessor:
#Processor class that has the full pipeline for processing lab tests, generating recommendations, and writing results to the database. Designed for use in both API endpoints and CLI scripts.

    FEATURES = ["ph", "turbidity", "dissolved_oxygen", "nitrates", "phosphates", "salinity"]

    def __init__(self):
        self.log = logging.getLogger(self.__class__.__name__)
        self._model   = joblib.load(MODEL_DIR / "model.pkl")
        self._imputer = joblib.load(MODEL_DIR / "imputer.pkl")
        self._encoder = joblib.load(MODEL_DIR / "label_encoder.pkl")
        self.log.info("WaterQualityProcessor initialised — artifacts loaded.")

    # Database operations 
    def fetch_unprocessed_tests(self) -> list[dict]:
        #Fetch all lab_tests rows that have no model_results entry yet.
        sql = """
            SELECT lt.*
            FROM   lab_tests lt
            LEFT JOIN model_results mr ON mr.test_id = lt.test_id
            WHERE  mr.result_id IS NULL
            ORDER  BY lt.created_at ASC
        """
        with get_db_instance().get_cursor() as conn:
            conn.execute(sql)
            rows = conn.fetchall()
        self.log.info(f"Found {len(rows)} unprocessed test(s).")
        return rows

    def fetch_test_by_id(self, test_id: int) -> dict | None:
        #Pull a single lab_tests row by test_id
        with get_db_instance().get_cursor() as conn:
            conn.execute("SELECT * FROM lab_tests WHERE test_id = %s", (test_id,))
            return conn.fetchone()

    def result_exists(self, test_id: int) -> bool:
        #Return True if a model_results row already exists for this test.
        with get_db_instance().get_cursor() as conn:
            conn.execute(
                "SELECT 1 FROM model_results WHERE test_id = %s LIMIT 1",
                (test_id,)
            )
            return conn.fetchone() is not None

    def _insert_model_result(self, test_id: int, wqi: float, health_score: float,
                              risk_level: str, ml_confidence: float) -> int:
        #Insert a row into model_results and return the new result_id.
        sql = """
            INSERT INTO model_results
                (test_id, wqi_score, health_score, risk_level, ml_confidence, analysis_date)
            VALUES
                (%s, %s, %s, %s, %s, %s)
        """
        with get_db_instance().get_cursor() as conn:
            conn.execute(sql, (test_id, wqi, health_score, risk_level,
                              ml_confidence, datetime.now()))
            return conn.lastrowid

    def _insert_recommendations(self, result_id: int, recs: list[dict]) -> int:
        #Bulk-insert recommendation rows. Returns number of rows inserted.
        if not recs:
            return 0
        sql = """
            INSERT INTO recommendations
                (result_id, recommendation_text, recommendation_type, severity_level)
            VALUES
                (%s, %s, %s, %s)
        """
        rows = [
            (result_id,
             r["recommendation_text"],
             r["recommendation_type"],
             r["severity_level"])
            for r in recs
        ]
        with get_db_instance().get_cursor() as conn:
            conn.executemany(sql, rows)
        return len(rows)

    # Data cleaning 

    def _clean_row(self, row: dict) -> dict:
        raw = np.array([[
            row.get("ph")               if row.get("ph")               is not None else np.nan,
            row.get("turbidity")        if row.get("turbidity")        is not None else np.nan,
            row.get("dissolved_oxygen") if row.get("dissolved_oxygen") is not None else np.nan,
            row.get("nitrates")         if row.get("nitrates")         is not None else np.nan,
            row.get("phosphates")       if row.get("phosphates")       is not None else np.nan,
            row.get("salinity")         if row.get("salinity")         is not None else np.nan,
        ]])

        imputed = self._imputer.transform(raw)[0]

        return {
            "ph":               float(imputed[0]),
            "turbidity":        float(imputed[1]),
            "dissolved_oxygen": float(imputed[2]),
            "nitrates":         float(imputed[3]),
            "phosphates":       float(imputed[4]),
            "salinity":         float(imputed[5]),
        }

    #ML prediction 

    def _ml_predict(self, cleaned: dict) -> tuple[str, float]:
        x        = np.array([[cleaned[f] for f in self.FEATURES]])
        label_id = int(self._model.predict(x)[0])
        proba    = self._model.predict_proba(x)[0]
        label    = self._encoder.inverse_transform([label_id])[0]
        conf     = round(float(proba[label_id]) * 100, 1)
        return label, conf

    #Core pipeline 
    def process_test(self, row: dict) -> dict:
        test_id = row["test_id"]
        self.log.info(f"Processing test_id={test_id} (user_id={row.get('user_id')})")

        if self.result_exists(test_id):
            self.log.warning(f"test_id={test_id} already processed. Skipping.")
            return {"test_id": test_id, "status": "already_processed"}

        # Step 1 — Clean
        cleaned = self._clean_row(row)
        self.log.debug(f"  Cleaned values: {cleaned}")

        # Step 2 — WQI assessment
        assessment   = full_assessment(**cleaned)
        wqi = assessment["wqi"]
        health_score = assessment["health_score"]
        self.log.debug(f"  WQI={wqi}  Health={health_score}%  Risk={assessment['risk_level']}")

        # Step 3 — ML prediction (WQI-derived risk is authoritative)
        ml_label, ml_conf = self._ml_predict(cleaned)
        risk_level = assessment["risk_level"]
        self.log.info(f"  WQI risk: {risk_level}  |  ML: {ml_label} ({ml_conf}%)")

        # Step 4 — Recommendations
        rec_output = generate_recommendations(
            ph=cleaned["ph"],
            turbidity=cleaned["turbidity"],
            dissolved_oxygen=cleaned["dissolved_oxygen"],
            nitrates=cleaned["nitrates"],
            phosphates=cleaned["phosphates"],
            salinity=cleaned["salinity"],
            risk_level=risk_level,
            wqi=wqi,
            health_score=health_score,
        )

        # Step 5 — Write to DB
        if self.result_exists(test_id):
            self.log.warning(f"test_id={test_id} was processed. Skipping DB insert.")
            return {"test_id": test_id, "status": "already_processed"}
        result_id = self._insert_model_result(test_id, wqi, health_score, risk_level, ml_conf)
        n_recs    = self._insert_recommendations(result_id, rec_output["recommendations"])

        self.log.info(f" result_id={result_id} | {n_recs} recommendation(s) inserted")

        return {
            "test_id":           test_id,
            "result_id":         result_id,
            "status":            "processed",
            "wqi":               wqi,
            "health_score":      health_score,
            "risk_level":        risk_level,
            "ml_risk_label":     ml_label,
            "ml_confidence":     ml_conf,
            "overall_action":    rec_output["overall_action"],
            "n_violations":      rec_output["n_violations"],
            "n_recommendations": n_recs,
            "system_plan":       rec_output["system_plan"],
            "safe_parameters":   rec_output["safe_parameters"],
            "sub_indices":       assessment["sub_indices"],
            "cleaned_values":    cleaned,
        }

    def process_all_pending(self) -> list[dict]:
        #Process every lab_tests row that has no model_results entry.
        rows    = self.fetch_unprocessed_tests()
        results = []
        for row in rows:
            try:
                results.append(self.process_test(row))
            except Exception as e:
                self.log.error(f"Failed to process test_id={row.get('test_id')}: {e}")
                results.append({
                    "test_id": row.get("test_id"),
                    "status":  "error",
                    "detail":  str(e),
                })
        return results
