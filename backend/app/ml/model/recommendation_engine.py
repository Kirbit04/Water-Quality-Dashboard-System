# Recommendation engine for generating treatment recommendations based on lab test results and WQI risk level.

import numpy as np

# WHO/EPA limits, treatment options, and priority tiers for recommendation generation
WHO_LIMITS = {
    "ph": {
        "ideal": 7.0, "min": 6.5, "max": 8.5, "unit": "pH",
        "label": "pH",
    },
    "turbidity": {
        "ideal": 0.0, "min": None, "max": 4.0, "unit": "NTU",
        "label": "Turbidity",
    },
    "dissolved_oxygen": {
        "ideal": 8.0, "min": 6.5, "max": None, "unit": "mg/L",
        "label": "Dissolved Oxygen",
    },
    "nitrates": {
        "ideal": 0.0, "min": None, "max": 50.0, "unit": "mg/L",
        "label": "Nitrates",
    },
    "phosphates": {
        "ideal": 0.0, "min": None, "max": 0.1, "unit": "mg/L",
        "label": "Phosphates",
    },
    "salinity": {
        "ideal": 0.0, "min": None, "max": 1500, "unit": "µS/cm",
        "label": "Salinity / Conductivity",
    },
}

PRIORITY = {
    "nitrates":         1,   # methemoglobinaemia risk
    "dissolved_oxygen": 1,   # acute aquatic/health risk
    "ph":               2,   # affects all downstream treatment
    "turbidity":        2,   # must treat before disinfection
    "phosphates":       3,
    "salinity":         3,
}

URGENCY_ORDER = {"Critical": 0, "High": 1, "Moderate": 2, "Low": 3}

TREATMENTS = {
    "ph": {
        "too_low": {
            "recommendation_type": "pH Correction",
            "severity_level":      "Moderate",
            "primary":   ["Lime dosing (calcium hydroxide)", "Soda ash injection"],
            "secondary": ["Calcite / neutralising filter"],
            "notes":     "Low pH accelerates pipe corrosion and promotes metal leaching. Target pH 7.0–7.5.",
        },
        "too_high": {
            "recommendation_type": "pH Correction",
            "severity_level":      "Moderate",
            "primary":   ["CO₂ injection (carbonation)", "Acid dosing (dilute H₂SO₄ or HCl)"],
            "secondary": ["Ion exchange softening"],
            "notes":     "High pH reduces chlorine disinfection efficacy and causes scale formation.",
        },
    },
    "turbidity": {
        "too_high": {
            "recommendation_type": "Filtration",
            "severity_level":      "High",
            "primary":   ["Coagulation + flocculation + sedimentation", "Multi-media sand filtration"],
            "secondary": ["Ceramic or membrane microfiltration", "Slow sand filtration"],
            "notes":     "Turbidity above 4 NTU shields pathogens from disinfection. "
                         "Must be addressed BEFORE chlorination.",
        },
    },
    "dissolved_oxygen": {
        "too_low": {
            "recommendation_type": "Aeration",
            "severity_level":      "High",
            "primary":   ["Cascade aeration", "Diffused air aeration"],
            "secondary": ["Spray aeration", "Mechanical surface aerator"],
            "notes":     "DO below 6.5 mg/L promotes anaerobic decomposition and pathogen survival. "
                         "Target ≥ 8 mg/L.",
        },
    },
    "nitrates": {
        "too_high": {
            "recommendation_type": "Chemical Treatment",
            "severity_level":      "High",
            "primary":   ["Biological denitrification", "Ion exchange (nitrate-selective resin)"],
            "secondary": ["Reverse osmosis", "Electrodialysis"],
            "notes":     "Nitrates above 50 mg/L risk methemoglobinaemia (blue baby syndrome). "
                         "Investigate upstream agricultural runoff.",
        },
    },
    "phosphates": {
        "too_high": {
            "recommendation_type": "Chemical Treatment",
            "severity_level":      "Moderate",
            "primary":   ["Chemical precipitation (alum or ferric chloride)", "Biological phosphate removal"],
            "secondary": ["Membrane filtration", "Ion exchange"],
            "notes":     "Elevated phosphates promote algal blooms (eutrophication). "
                         "Likely source: agricultural runoff or sewage discharge.",
        },
    },
    "salinity": {
        "too_high": {
            "recommendation_type": "Desalination",
            "severity_level":      "Moderate",
            "primary":   ["Reverse osmosis (RO) filtration", "Electrodialysis reversal (EDR)"],
            "secondary": ["Nanofiltration", "Ion exchange demineralisation"],
            "notes":     "High salinity/conductivity indicates elevated dissolved salts. "
                         "RO is most effective when conductivity exceeds 2000 µS/cm.",
        },
    },
}


def _check_parameter(param: str, value: float) -> dict | None:
    # Check a single parameter against WHO/EPA limits and return a dict with violation details and treatment recommendation if out of bounds, else None.
    if value is None or (isinstance(value, float) and np.isnan(value)):
        return None

    lim       = WHO_LIMITS[param]
    violation = who_ref = excess_pct = None

    # pH can be too low or too high
    if param == "ph":
        if value < lim["min"]:
            violation = "too_low"
            who_ref   = lim["min"]
            excess_pct = round((lim["min"] - value) / lim["min"] * 100, 1)
        elif value > lim["max"]:
            violation = "too_high"
            who_ref   = lim["max"]
            excess_pct = round((value - lim["max"]) / lim["max"] * 100, 1)
        else:
            return None

    # dissolved oxygen is only too low
    elif param == "dissolved_oxygen":
        if value < lim["min"]:
            violation  = "too_low"
            who_ref    = lim["min"]
            excess_pct = round((lim["min"] - value) / lim["min"] * 100, 1)
        else:
            return None

    # The rest are standard and too high only
    else:
        if value > lim["max"]:
            violation  = "too_high"
            who_ref    = lim["max"]
            excess_pct = round((value - lim["max"]) / lim["max"] * 100, 1)
        else:
            return None

    # Severity from excess %
    severity = (
        "Critical" if excess_pct >= 200 else
        "High"     if excess_pct >= 100 else
        "Moderate" if excess_pct >= 25  else
        "Low"
    )

    tx = TREATMENTS[param][violation]

    return {
        "param":               param,
        "label":               lim["label"],
        "value":               round(value, 4),
        "who_limit":           who_ref,
        "unit":                lim["unit"],
        "violation":           violation,
        "excess_pct":          excess_pct,
        "severity":            severity,
        "priority":            PRIORITY.get(param, 4),
        # Columns for the recommendations table
        "recommendation_type": tx["recommendation_type"],
        "severity_level":      tx["severity_level"],
        "primary":             tx["primary"],
        "secondary":           tx.get("secondary", []),
        "notes":               tx["notes"],
    }


def _build_system_plan(flags: list, risk_level: str) -> list[str]:
    #Ordered action plan that respects treatment sequencing rules.
    if not flags:
        return ["✅ All parameters within WHO/EPA limits. Continue regular monitoring."]

    plan  = []
    step  = 1
    names = {f["param"] for f in flags}

    critical = [f for f in flags if f["severity"] == "Critical"]
    if critical:
        params_str = ", ".join(f["label"] for f in critical)
        plan.append(f"Step {step}: 🚨 IMMEDIATE — Do not consume. Critical violation(s): {params_str}.")
        step += 1

    # Turbidity BEFORE disinfection
    if "turbidity" in names:
        f = next(f for f in flags if f["param"] == "turbidity")
        plan.append(f"Step {step}: Install coagulation + sand filtration to reduce turbidity "
                    f"({f['value']} NTU → <4 NTU) before any disinfection step.")
        step += 1

    # DO aeration early — improves downstream chemistry
    if "dissolved_oxygen" in names:
        f = next(f for f in flags if f["param"] == "dissolved_oxygen")
        plan.append(f"Step {step}: Aerate water to raise dissolved oxygen "
                    f"({f['value']} mg/L → ≥8 mg/L) via cascade or diffused aeration.")
        step += 1

    # Nitrates
    if "nitrates" in names:
        f = next(f for f in flags if f["param"] == "nitrates")
        plan.append(f"Step {step}: Treat nitrates ({f['value']} mg/L) via biological denitrification "
                    f"or ion exchange. Inspect for upstream agricultural sources.")
        step += 1

    # pH — before mineral treatment
    if "ph" in names:
        f = next(f for f in flags if f["param"] == "ph")
        direction = "raise" if f["violation"] == "too_low" else "lower"
        plan.append(f"Step {step}: {direction.capitalize()} pH ({f['value']}) to 7.0–7.5 range before "
                    f"downstream mineral treatment.")
        step += 1

    # Salinity — RO handles phosphates too if co-occurring
    if "salinity" in names:
        f = next(f for f in flags if f["param"] == "salinity")
        co_phos = " (will also reduce phosphates)" if "phosphates" in names else ""
        plan.append(f"Step {step}: Install reverse osmosis to reduce salinity "
                    f"({f['value']} µS/cm → <1500 µS/cm){co_phos}.")
        step += 1

    # Phosphates — only if salinity RO not already handling it
    elif "phosphates" in names:
        f = next(f for f in flags if f["param"] == "phosphates")
        plan.append(f"Step {step}: Remove phosphates ({f['value']} mg/L) via chemical "
                    f"precipitation (alum or ferric chloride).")
        step += 1

    plan.append(f"Step {step}: Establish regular monitoring programme "
                f"({'monthly' if risk_level in ('High Risk','Critical Risk') else 'quarterly'} "
                f"testing recommended for {risk_level} classification).")
    return plan


def generate_recommendations(
    ph: float,
    turbidity: float,
    dissolved_oxygen: float,
    nitrates: float,
    phosphates: float,
    salinity: float,
    risk_level: str,
    wqi: float,
    health_score: float,
) -> dict:
    #Main function to generate recommendations based on parameter values and overall risk level. Returns dict with recommendation details and system plan.
    params = {
        "ph": ph, "turbidity": turbidity,
        "dissolved_oxygen": dissolved_oxygen,
        "nitrates": nitrates, "phosphates": phosphates,
        "salinity": salinity,
    }

    flags = []
    safe  = []

    for param, value in params.items():
        flag = _check_parameter(param, value)
        if flag:
            flags.append(flag)
        elif value is not None:
            safe.append(WHO_LIMITS[param]["label"])

    # Sort: priority tier → urgency severity
    flags.sort(key=lambda f: (f["priority"], URGENCY_ORDER.get(f["severity"], 9)))

    # Build recommendation_text for each flag (ready for DB insert)
    db_recommendations = []
    for flag in flags:
        primary_str   = "; ".join(flag["primary"])
        secondary_str = ("; ".join(flag["secondary"]) + ". " if flag["secondary"] else "")
        text = (
            f"{flag['label']} is {flag['violation'].replace('_', ' ')} at "
            f"{flag['value']} {flag['unit']} (WHO limit: {flag['who_limit']} {flag['unit']}, "
            f"{flag['excess_pct']:.0f}% {'above' if flag['violation']=='too_high' else 'below'} limit). "
            f"Recommended treatment: {primary_str}. "
            f"{secondary_str}"
            f"{flag['notes']}"
        )
        db_recommendations.append({
            "recommendation_text": text,
            "recommendation_type": flag["recommendation_type"],
            "severity_level":      flag["severity_level"],
            "param":               flag["param"],
            "violation":           flag["violation"],
            "excess_pct":          flag["excess_pct"],
        })

    # Overall action message
    n_critical = sum(1 for f in flags if f["severity"] == "Critical")
    if n_critical > 0:
        overall_action = (f"⛔ UNSAFE — {n_critical} critical violation(s) detected. "
                          f"Do not consume. Immediate treatment required.")
    elif risk_level == "Critical Risk":
        overall_action = "⛔ Critical risk. Immediate treatment required before consumption."
    elif risk_level == "High Risk":
        overall_action = "🔴 Treatment required before this water is safe for consumption."
    elif risk_level == "Moderate Risk":
        overall_action = "🟡 Water is usable with caution. Treatment recommended."
    else:
        overall_action = "🟢 Water quality is within safe limits. Continue regular monitoring."

    return {
        "overall_action":   overall_action,
        "violations":       flags,
        "recommendations":  db_recommendations,   # → INSERT into recommendations
        "system_plan":      _build_system_plan(flags, risk_level),
        "safe_parameters":  safe,
        "n_violations":     len(flags),
    }