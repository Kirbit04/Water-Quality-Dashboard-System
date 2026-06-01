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

    # ===== PPT to EC CONVERSION =====
    # VISIBLE CONVERSION: Converting user-input salinity from PPT (Parts Per Thousand)
    # to EC (Electrical Conductivity in µS/cm) for ML model training
    # Formula: EC (µS/cm) = PPT × 50
    # This conversion is applied because the ML model was trained on EC values,
    # while users input salinity in PPT (more intuitive for water quality monitoring)
    # ================================
    def _convert_ppt_to_ec(self, cleaned: dict) -> dict:
        """
        Convert salinity from PPT (Parts Per Thousand) to EC (Electrical Conductivity µS/cm).
        
        Input salinity (cleaned data) is in PPT.
        Output salinity is converted to EC for ML model.
        
        Conversion formula: EC (µS/cm) = PPT × 50
        This approximation works well for most freshwater and brackish water scenarios.
        """
        ppt_value = cleaned["salinity"]
        
        # Apply PPT to EC conversion
        ec_value = ppt_value * 50
        
        self.log.info(f"  PPT→EC Conversion: {ppt_value} PPT → {ec_value} µS/cm")
        
        # Return cleaned dict with converted salinity (now in EC)
        converted = cleaned.copy()
        converted["salinity"] = ec_value
        return converted

    #ML prediction 

    def _ml_predict(self, cleaned: dict) -> tuple[str, float]:
        x        = np.array([[cleaned[f] for f in self.FEATURES]])
        label_id = int(self._model.predict(x)[0])
        proba    = self._model.predict_proba(x)[0]
        label    = self._encoder.inverse_transform([label_id])[0]
        conf     = round(float(proba[label_id]) * 100, 1)
        return label, conf

    #Core pipeline 
    
    def _normalize_occupation(self, occupation_str: str) -> str:
        """
        Map occupation string from database to recommendation engine keys.
        Handles various input formats (case-insensitive, partial matches).
        """
        if not occupation_str:
            return "local_user"
        
        occ_lower = occupation_str.lower().strip()
        
        # Direct mappings
        mapping = {
            "water_supplier": "water_supplier",
            "water supplier": "water_supplier",
            "supplier": "water_supplier",
            "farmer": "farmer",
            "irrigation": "farmer",
            "livestock_farmer": "livestock_farmer",
            "livestock farmer": "livestock_farmer",
            "livestock": "livestock_farmer",
            "cattle": "livestock_farmer",
            "local_user": "local_user",
            "local user": "local_user",
            "domestic": "local_user",
            "household": "local_user",
            "community": "local_user",
        }
        
        # Try exact match first
        if occ_lower in mapping:
            return mapping[occ_lower]
        
        # Try partial match
        for key, value in mapping.items():
            if key in occ_lower or occ_lower in key:
                return value
        
        # Default fallback
        return "local_user"
    
    def process_test(self, row: dict) -> dict:
        test_id = row["test_id"]
        self.log.info(f"Processing test_id={test_id} (user_id={row.get('user_id')})")

        if self.result_exists(test_id):
            self.log.warning(f"test_id={test_id} already processed. Skipping.")
            return {"test_id": test_id, "status": "already_processed"}

        # Step 1 — Clean (data now in original units: PPT for salinity)
        cleaned = self._clean_row(row)
        self.log.debug(f"  Cleaned values: {cleaned}")
        
        # Store original PPT value for recommendations
        original_salinity_ppt = cleaned["salinity"]

        # Step 1.5 — Convert PPT to EC for ML model
        # CONVERSION POINT: User inputs PPT, but ML model expects EC (Electrical Conductivity)
        cleaned_for_ml = self._convert_ppt_to_ec(cleaned)
        self.log.debug(f"  Converted salinity for ML: {cleaned_for_ml['salinity']} µS/cm")

        # Step 2 — WQI assessment (using EC-converted salinity)
        assessment   = full_assessment(**cleaned_for_ml)
        wqi = assessment["wqi"]
        health_score = assessment["health_score"]
        self.log.debug(f"  WQI={wqi}  Health={health_score}%  Risk={assessment['risk_level']}")

        # Step 3 — ML prediction (WQI-derived risk is authoritative, using EC-converted salinity)
        ml_label, ml_conf = self._ml_predict(cleaned_for_ml)
        risk_level = assessment["risk_level"]
        self.log.info(f"  WQI risk: {risk_level}  |  ML: {ml_label} ({ml_conf}%)")

        # Step 4 — Recommendations
        # Normalize occupation and build water_data dict for recommendation engine
        occupation_key = self._normalize_occupation(row.get("occupation", "local_user"))
        
        # Use original PPT value for recommendations (not the EC-converted value)
        water_data = {
            "pH": cleaned["ph"],
            "DO": cleaned["dissolved_oxygen"],
            "NO3": cleaned["nitrates"],
            "PO4": cleaned["phosphates"],
            "salinity_ppt": original_salinity_ppt,  # Using original PPT value for recommendations
            "Turbidity": cleaned["turbidity"],
            "ml_quality_class": ml_label,
        }
        
        rec_output = generate_recommendations(
            water_data=water_data,
            occupation=occupation_key,
        )

        # Step 5 — Write to DB
        # Format recommendations for database insertion
        db_recommendations = []
        for violation in rec_output["violations"]:
            for action in rec_output["actionable_recommendations"]:
                if action.get("parameter") == violation["parameter"]:
                    text = (
                        f"{violation['parameter']} violation: {violation['reason']}. "
                        f"Recommended treatment: {action.get('treatment', 'N/A')}. "
                        f"Priority: {action.get('priority', 'N/A')}"
                    )
                    db_recommendations.append({
                        "recommendation_text": text,
                        "recommendation_type": "Treatment",
                        "severity_level": violation["severity"],
                    })
                    break
        
        if not db_recommendations:
            # Add overall status as recommendation if no violations
            db_recommendations.append({
                "recommendation_text": rec_output["overall_status"],
                "recommendation_type": "Status",
                "severity_level": "Info",
            })
        
        if self.result_exists(test_id):
            self.log.warning(f"test_id={test_id} was processed. Skipping DB insert.")
            return {"test_id": test_id, "status": "already_processed"}
        result_id = self._insert_model_result(test_id, wqi, health_score, risk_level, ml_conf)
        n_recs    = self._insert_recommendations(result_id, db_recommendations)

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
            "occupation":        rec_output["occupation"],
            "overall_status":    rec_output["overall_status"],
            "n_violations":      len(rec_output["violations"]),
            "n_recommendations": n_recs,
            "monitoring_frequency": rec_output["monitoring_frequency"],
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
