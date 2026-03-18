#Complete WQI calculation engine based on WHO/EPA standards, with sub-indices, health score, and risk level mapping.

import numpy as np

# WHO/EPA water quality standards and weights for WQI calculation
STANDARDS = {
    "ph":               {"ideal": 7.0,  "min": 6.5,   "max": 8.5,   "unit": "pH",     "weight": 0.22},
    "turbidity":        {"ideal": 0.0,  "min": 0.0,   "max": 4.0,   "unit": "NTU",    "weight": 0.18},
    "dissolved_oxygen": {"ideal": 14.6, "min": 6.5,   "max": 14.6,  "unit": "mg/L",   "weight": 0.25},
    "nitrates":         {"ideal": 0.0,  "min": 0.0,   "max": 50.0,  "unit": "mg/L",   "weight": 0.15},
    "phosphates":       {"ideal": 0.0,  "min": 0.0,   "max": 0.1,   "unit": "mg/L",   "weight": 0.10},
    "salinity":         {"ideal": 0.0,  "min": 0.0,   "max": 1500,  "unit": "µS/cm",  "weight": 0.10},
}

# Risk level thresholds based on WQI score
RISK_LEVELS = [
    (25,  "Low Risk",      "Excellent", "#2ECC71"),
    (50,  "Moderate Risk", "Good",      "#F1C40F"),
    (75,  "High Risk",     "Poor",      "#E67E22"),
    (100, "Critical Risk", "Unsafe",    "#E74C3C"),
]


def _qi_ph(value: float) -> float:
    #pH sub-index: deviation from ideal 7.0, normalised 0–100.
    dev     = abs(value - STANDARDS["ph"]["ideal"])
    max_dev = max(
        abs(STANDARDS["ph"]["min"]  - STANDARDS["ph"]["ideal"]),
        abs(STANDARDS["ph"]["max"] - STANDARDS["ph"]["ideal"]),
    )
    return float(np.clip(dev / max_dev * 100, 0, 100))


def _qi_do(value: float) -> float:
    #Dissolved oxygen: inverted — lower DO means worse quality.
    ideal = STANDARDS["dissolved_oxygen"]["ideal"]
    if value >= ideal:
        return 0.0
    return float(np.clip((ideal - value) / ideal * 100, 0, 100))


def _qi_standard(param: str, value: float) -> float:
    #Generic: linear 0 → 100 as value approaches max limit.
    return float(np.clip(value / STANDARDS[param]["max"] * 100, 0, 100))


def compute_sub_indices(ph, turbidity, dissolved_oxygen, nitrates, phosphates, salinity) -> dict:
    #Return per-parameter quality sub-indices (0 = best, 100 = worst).
    vals = dict(ph=ph, turbidity=turbidity, dissolved_oxygen=dissolved_oxygen,
                nitrates=nitrates, phosphates=phosphates, salinity=salinity)

    sub = {}
    for param, value in vals.items():
        if value is None or (isinstance(value, float) and np.isnan(value)):
            sub[param] = 50.0   # neutral fallback for missing values
            continue
        if param == "ph":
            sub[param] = _qi_ph(value)
        elif param == "dissolved_oxygen":
            sub[param] = _qi_do(value)
        else:
            sub[param] = _qi_standard(param, value)
    return sub


def compute_wqi(sub_indices: dict) -> float:
    #Weighted WQI across the 6 parameters (0 = perfect, 100 = unsafe).
    total_w = sum(STANDARDS[p]["weight"] for p in sub_indices)
    wqi     = sum(STANDARDS[p]["weight"] * sub_indices[p] for p in sub_indices)
    return round(float(np.clip(wqi / total_w, 0, 100)), 2)


def compute_health_score(wqi: float) -> float:
    #Non-linear health score (%) — matches the notebook's banding:

    if np.isnan(wqi):
        return float("nan")
    if wqi <= 25:
        return round(100 - wqi * 0.4, 1)
    if wqi <= 50:
        return round(90 - (wqi - 25) * 1.2, 1)
    if wqi <= 75:
        return round(60 - (wqi - 50) * 1.2, 1)
    if wqi <= 100:
        return round(30 - (wqi - 75) * 0.8, 1)
    return round(max(0, 10 - (wqi - 100) * 0.1), 1)


def wqi_to_risk(wqi: float) -> dict:
    for threshold, risk, quality, color in RISK_LEVELS:
        if wqi <= threshold:
            return {"risk_level": risk, "quality_label": quality, "color": color}
    return {"risk_level": "Critical Risk", "quality_label": "Unsafe", "color": "#E74C3C"}


def full_assessment(ph, turbidity, dissolved_oxygen, nitrates, phosphates, salinity) -> dict:
    #Run a complete WQI assessment for one water sample.
    sub          = compute_sub_indices(ph, turbidity, dissolved_oxygen, nitrates, phosphates, salinity)
    wqi          = compute_wqi(sub)
    health_score = compute_health_score(wqi)
    risk_info    = wqi_to_risk(wqi)

    return {
        "wqi":          wqi,
        "health_score": health_score,
        **risk_info,
        "sub_indices":  {k: round(v, 2) for k, v in sub.items()},
    }