#Water Quality Rule-Based Recommendation Engine
#Occupation-aware with WHO compliance thresholds
#Enhanced: parameter criticality ranking + safe treatment sequencing

from datetime import datetime, timezone

# Parameter weights (adapted from WHO/EPA WQI standards)
PARAMETER_WEIGHTS = {
    "DO":        0.25,
    "pH":        0.22,
    "Turbidity": 0.18,
    "NO3":       0.15,
    "PO4":       0.10,
    "EC":        0.10,
    "TDS":       0.10,  # TDS shares weight with EC (derived from it)
}

# Safe treatment sequence
TREATMENT_SEQUENCE_ORDER = {
    "Turbidity": 1,
    "pH":        2,
    "DO":        3,
    "NO3":       4,
    "PO4":       5,
    "EC":        6,
    "TDS":       6,  # TDS and EC treated together
}


# Occupation-specific thresholds
OCCUPATION_RULES = {
    "water_supplier": {
        "displayName": "Water Supplier",
        "priority": 1,
        "thresholds": {
            "pH": {"min": 6.5, "max": 8.5},
            "DO": {"min": 4.0},
            "NO3": {"max": 10.0},
            "PO4": {"max": 0.05},
            "TDS": {"max": 500},
            "Turbidity": {"max": 5, "ideal": 1},
            "EC": {"max": 800},
        },
        "treatments": {
            "high_no3": "Reverse osmosis or ion exchange resin",
            "high_po4": "Chemical precipitation (alum, ferric chloride)",
            "high_ec": "Desalination or reverse osmosis",
            "high_turbidity": "Multi-stage filtration (sand → activated carbon → micron)",
            "low_do": "Aeration or degassing columns",
            "low_ph": "Alkali dosing (lime, soda ash)",
            "high_ph": "Acid dosing (CO2 injection or dilute acid)",
        },
        "monitoring": "Daily + after treatment",
    },

    "farmer": {
        "displayName": "Farmer (Irrigation)",
        "priority": 2,
        "thresholds": {
            "pH": {"min": 6.0, "max": 8.0},
            "DO": {"min": 5.0},
            "NO3": {"max": 10.0, "warning": 45.0},
            "PO4": {"max": 0.5},
            "TDS": {"max": 1200},
            "Turbidity": {"max": 10, "ideal": 5},
            "EC": {"max": 1500},
        },
        "treatments": {
            "high_no3": "Dilution with rainwater or low-nitrogen source",
            "high_ec": "Blending with fresher water or drip irrigation (salt concentration)",
            "high_po4": "Buffer crops (reed beds) or chemical treatment",
            "high_turbidity": "Settling ponds or mechanical filtration",
            "low_ph": "Lime addition before irrigation",
            "high_ph": "Acidification (dilute sulfuric acid or acidic fertilisers)",
        },
        "monitoring": "Weekly during growing season",
    },

    "livestock_farmer": {
        "displayName": "Livestock Farmer",
        "priority": 3,
        "thresholds": {
            "pH": {"min": 6.0, "max": 8.0},
            "DO": {"min": 3.0},
            "NO3": {"max": 100.0},
            "PO4": {"max": 1.0},
            "TDS": {"max": 3000},
            "Turbidity": {"max": 20, "ideal": 10},
            "EC": {"max": 3000},
        },
        "treatments": {
            "high_no3": "Blend with cleaner water (40-60 mix) or filter through activated carbon",
            "high_ec": "Dilution strategy or provide alternative water source",
            "high_po4": "Usually not critical for livestock",
            "high_turbidity": "Simple settling tanks; boil before feeding to newborns",
            "low_do": "Usually not critical unless stagnant (odor check)",
        },
        "monitoring": "Bi-weekly; more if animals show stress",
    },

    "local_user": {
        "displayName": "Local Community/Domestic Use",
        "priority": 2,
        "thresholds": {
            "pH": {"min": 7.0, "max": 8.0},
            "DO": {"min": 6.0},
            "NO3": {"max": 10.0},
            "PO4": {"max": 0.1},
            "TDS": {"max": 500},
            "Turbidity": {"max": 3, "ideal": 1},
            "EC": {"max": 800},
        },
        "treatments": {
            "high_no3": "Boiling does NOT remove nitrates; use RO or distillation",
            "high_ec": "Desalination or water exchange program",
            "high_po4": "Chemical precipitation",
            "high_turbidity": "Home filtration pitcher or cartridge filter",
            "low_do": "Aerate by letting sit 24h or vigorous shaking",
            "low_ph": "Alkali dosing or neutralisation filter (calcite cartridge)",
            "high_ph": "CO2 injection or dilute acid neutralisation",
        },
        "monitoring": "Monthly for safety; quarterly detailed",
    },
}


def convert_salinity_to_ec(salinity_ppt):
    return salinity_ppt * 50


def calculate_tds(water_data):
    """
    Calculate Total Dissolved Solids from EC

    TDS (ppm) ≈ EC (µS/cm) * 0.64
    """
    if water_data.get("TDS") is not None:
        return water_data["TDS"]

    if water_data.get("EC") is not None:
        return water_data["EC"] * 0.64

    if water_data.get("salinity_ppt") is not None:
        return water_data["salinity_ppt"] * 640

    return None


def estimate_treatment_cost(parameter, value, threshold):
    #Treatment cost estimation based on deviation from thresholds.
    max_threshold = threshold.get("max")

    if max_threshold is None:
        return "Unknown"

    deviation = abs(value - max_threshold) / max_threshold

    if deviation < 0.1:
        return "Low (Ksh 15,000–20,000)"
    elif deviation < 0.5:
        return "Medium (Ksh 20,000–50,000)"
    else:
        return "High (Ksh 50,000+)"


def check_occupation_compatibility(water_data, current_occupation):
    #Check if water quality meets requirements for other occupations.
    compatible = []

    for key, rules in OCCUPATION_RULES.items():

        if key == current_occupation:
            continue

        passes = True

        for param, threshold in rules["thresholds"].items():

            value = (
                calculate_tds(water_data)
                if param == "TDS"
                else water_data.get(param)
            )

            if value is None:
                continue

            if (
                ("min" in threshold and value < threshold["min"]) or
                ("max" in threshold and value > threshold["max"])
            ):
                passes = False

        if passes:
            compatible.append(rules["displayName"])

    return compatible if compatible else ["None - requires treatment first"]



# Criticality scoring
def compute_criticality_score(param, value, threshold, rules):

    weight = PARAMETER_WEIGHTS.get(param, 0.05)

    max_val = threshold.get("max")
    min_val = threshold.get("min")

    if max_val is not None and value > max_val:
        severity = min((value - max_val) / max_val, 2.0)
    elif min_val is not None and value < min_val:
        severity = min((min_val - value) / min_val, 2.0)
    else:
        severity = 0.0

    return round(weight * (1 + severity), 4)


def rank_violations_by_criticality(violations_with_scores):
    """
    Sort violations by (treatment_sequence_order, criticality_score DESC).

    Within the same treatment step, the most critical parameter is listed
    first.  Across steps, the physically-mandated sequence takes precedence
    so that treatments never interfere with each other.
    """
    return sorted(
        violations_with_scores,
        key=lambda v: (
            TREATMENT_SEQUENCE_ORDER.get(v["parameter"], 99),
            -v["criticality_score"],
        ),
    )


# Main recommendation function
def generate_recommendations(water_data, occupation):

    if occupation not in OCCUPATION_RULES:
        raise ValueError(
            f"Invalid occupation: {occupation}. "
            f"Must be one of: {', '.join(OCCUPATION_RULES.keys())}"
        )

    rules = OCCUPATION_RULES[occupation]

    ec_microsiemens = convert_salinity_to_ec(
        water_data["salinity_ppt"]
    )

    full_data = {
        **water_data,
        "EC": ec_microsiemens,
        "salinity_ppt": water_data["salinity_ppt"],
    }

    recommendation = {
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "occupation": rules["displayName"],
        "occupationKey": occupation,

        "input_parameters": {
            "pH": water_data.get("pH"),
            "DO": water_data.get("DO"),
            "NO3": water_data.get("NO3"),
            "PO4": water_data.get("PO4"),
            "salinity_ppt": water_data.get("salinity_ppt"),
            "EC_microsiemens": ec_microsiemens,
            "Turbidity": water_data.get("Turbidity"),
            "ML_quality_class": water_data.get("ml_quality_class"),
        },

        "compliance_checks": {},
        "violations": [],
        "warnings": [],
        "actionable_recommendations": [],
        "overall_status": None,
        "monitoring_frequency": rules["monitoring"],
        "parameter_criticality_ranking": [],
        "treatment_schedule": [],
    }

    parameters_to_check = [
        "pH",
        "DO",
        "NO3",
        "PO4",
        "TDS",
        "Turbidity",
        "EC",
    ]

    # ===== Compliance Checks =====
    violations_with_scores = []

    for param in parameters_to_check:

        value = (
            calculate_tds(full_data)
            if param == "TDS"
            else full_data.get(param)
        )

        threshold = rules["thresholds"].get(param)

        if threshold is None:
            continue

        check = {
            "parameter": param,
            "measured_value": value,
            "threshold_min": threshold.get("min"),
            "threshold_max": threshold.get("max"),
            "status": "PASS",
            "message": "",
            "weight": PARAMETER_WEIGHTS.get(param, 0.05),
        }

        # Minimum check
        if (
            threshold.get("min") is not None and
            value < threshold["min"]
        ):
            check["status"] = "FAIL"
            check["message"] = (
                f"Below minimum ({value} < {threshold['min']})"
            )

            criticality = compute_criticality_score(
                param, value, threshold, rules
            )

            violation = {
                "parameter": param,
                "reason": check["message"],
                "severity": "Critical",
                "criticality_score": criticality,
                "weight": PARAMETER_WEIGHTS.get(param, 0.05),
                "treatment_step": TREATMENT_SEQUENCE_ORDER.get(param, 99),
            }

            recommendation["violations"].append(violation)
            violations_with_scores.append(violation)

        # Maximum check
        elif (
            threshold.get("max") is not None and
            value > threshold["max"]
        ):
            check["status"] = "FAIL"
            check["message"] = (
                f"Exceeds maximum ({value} > {threshold['max']})"
            )

            criticality = compute_criticality_score(
                param, value, threshold, rules
            )

            violation = {
                "parameter": param,
                "reason": check["message"],
                "severity": "Critical",
                "criticality_score": criticality,
                "weight": PARAMETER_WEIGHTS.get(param, 0.05),
                "treatment_step": TREATMENT_SEQUENCE_ORDER.get(param, 99),
            }

            recommendation["violations"].append(violation)
            violations_with_scores.append(violation)

        # Warning checks
        elif (
            param == "NO3" and
            full_data["NO3"] > 45 and
            rules["thresholds"]["NO3"]["max"] < 45
        ):
            check["status"] = "WARN"
            check["message"] = (
                f"Approaching caution level ({value} > 45 ppm)"
            )

            recommendation["warnings"].append({
                "parameter": param,
                "reason": check["message"],
            })

        elif param == "Turbidity" and value > 5:
            check["status"] = "WARN"
            check["message"] = (
                "Acceptable but elevated turbidity"
            )

            recommendation["warnings"].append({
                "parameter": param,
                "reason": check["message"],
            })

        else:
            check["message"] = "Within acceptable range"

        recommendation["compliance_checks"][param] = check

    criticality_ranked = sorted(
        violations_with_scores,
        key=lambda v: -v["criticality_score"],
    )

    recommendation["parameter_criticality_ranking"] = [
        {
            "rank": idx + 1,
            "parameter": v["parameter"],
            "criticality_score": v["criticality_score"],
            "weight": v["weight"],
            "issue": v["reason"],
            "note": (
                "High health/environmental risk — weight × severity deviation"
            ),
        }
        for idx, v in enumerate(criticality_ranked)
    ]
    
    sequenced = rank_violations_by_criticality(violations_with_scores)

    treatment_schedule = []
    for v in sequenced:
        step_num = v["treatment_step"]
        param = v["parameter"]
        param_lower = param.lower()

        # Determine direction of violation for treatment key selection
        threshold = rules["thresholds"].get(param, {})
        direction = "high"
        value = (
            calculate_tds(full_data) if param == "TDS"
            else full_data.get(param)
        )
        if (
            threshold.get("min") is not None and
            value is not None and
            value < threshold["min"]
        ):
            direction = "low"

        recommended_treatment = (
            rules["treatments"].get(f"{direction}_{param_lower}")
            or rules["treatments"].get(f"high_{param_lower}")
            or rules["treatments"].get(f"low_{param_lower}")
            or "Consult water treatment specialist"
        )

        cost = estimate_treatment_cost(
            param,
            full_data.get(param, 0),
            threshold,
        )

        # Build rationale explaining WHY this step comes here in the sequence
        step_rationale = {
            1: (
                "STEP 1 — Remove turbidity/solids first: suspended particles "
                "shield pathogens from disinfection and consume chemical "
                "reagents added in later steps, reducing their effectiveness."
            ),
            2: (
                "STEP 2 — Correct pH after solids removal: pH governs "
                "ionisation of all dissolved species and the efficiency of "
                "every downstream chemical treatment. Wrong pH can cause "
                "reagents to form harmful by-products."
            ),
            3: (
                "STEP 3 — Aerate to restore DO after pH is stable: aerating "
                "at the wrong pH can strip CO2 and destabilise pH; oxidised "
                "iron/manganese from aeration must be settled/filtered before "
                "chemical dosing."
            ),
            4: (
                "STEP 4 — Remove nitrates after pH correction: ion-exchange "
                "resins and RO membranes operate optimally at pH 6.5–8.0 and "
                "foul rapidly if turbidity is not already resolved."
            ),
            5: (
                "STEP 5 — Precipitate phosphates after nitrate treatment: "
                "coagulants (alum, ferric chloride) require a stable pH "
                "window and must be added before any dilution/desalination "
                "step to avoid re-dissolving precipitates."
            ),
            6: (
                "STEP 6 — Address EC/TDS/salinity last: dilution or "
                "desalination changes ionic strength and would alter the "
                "equilibria of all earlier chemical treatments if done "
                "prematurely."
            ),
        }.get(step_num, "Consult a water treatment specialist for sequencing.")

        entry = {
            "treatment_step": step_num,
            "parameter": param,
            "issue": v["reason"],
            "criticality_score": v["criticality_score"],
            "treatment": recommended_treatment,
            "priority": (
                "URGENT (implement within 48 hours)"
                if v["severity"] == "Critical"
                else "MEDIUM (within 1 week)"
            ),
            "cost_estimate": cost,
            "sequencing_rationale": step_rationale,
        }

        treatment_schedule.append(entry)

        # Also add to actionable_recommendations (legacy field) for backward
        # compatibility, preserving the sequenced order
        recommendation["actionable_recommendations"].append({
            "parameter": param,
            "issue": v["reason"],
            "treatment": recommended_treatment,
            "priority": entry["priority"],
            "cost_estimate": cost,
        })

    recommendation["treatment_schedule"] = treatment_schedule

    # ===== Overall Status =====
    if (
        len(recommendation["violations"]) == 0 and
        len(recommendation["warnings"]) == 0
    ):

        recommendation["overall_status"] = (
            "Excellent - WHO Compliant"
        )

        recommendation["actionable_recommendations"] = [{
            "action": "Maintain current water management",
            "description": (
                "Water meets all WHO standards "
                "and occupation-specific requirements"
            ),
            "priority": "MAINTENANCE",
            "frequency": rules["monitoring"],
        }]

    elif len(recommendation["violations"]) == 0:

        recommendation["overall_status"] = (
            "Good - Minor Issues"
        )

        recommendation["actionable_recommendations"].insert(0, {
            "action": "Monitor elevated parameters",
            "description": (
                f"{len(recommendation['warnings'])} parameter(s) "
                "approaching warning threshold"
            ),
            "priority": "MEDIUM",
            "frequency": "Weekly checks",
        })

    elif len(recommendation["violations"]) <= 2:

        recommendation["overall_status"] = (
            "Fair - Treatment Needed"
        )

    else:

        recommendation["overall_status"] = (
            "Poor - Multiple Violations, Urgent Action Required"
        )

    # ===== Compatibility Check =====
    recommendation["suitable_for_other_occupations"] = (
        check_occupation_compatibility(
            full_data,
            occupation
        )
    )

    return recommendation