#Water Quality Rule-Based Recommendation Engine
#Occupation-aware with WHO compliance thresholds

from datetime import datetime

WHO_BASELINES = {
    "pH": {"min": 6.5, "max": 8.5, "ideal": 7.0},
    "DO": {"min": 3.0, "max": 14.0, "ideal": 8.0},  # mg/L
    "NO3": {"max": 10.0, "warning": 50.0},  # ppm
    "PO4": {"max": 0.1, "warning": 0.5},  # ppm
    "TDS": {"excellent": 300, "acceptable": 500, "warning": 1000},  # ppm
    "Turbidity": {"excellent": 1, "acceptable": 5, "warning": 10},  # NTU
    "EC": {"safe_aquatic": 300, "caution": 500},  # µS/cm
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
        },
        "monitoring": "Monthly for safety; quarterly detailed",
    },
}


def convert_salinity_to_ec(salinity_ppt):
    """
    Convert salinity (ppt) to electrical conductivity (µS/cm)

    Formula:
        EC = salinity_ppt * 50
    """
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
    """
    Estimate treatment cost (simplified)
    """
    max_threshold = threshold.get("max")

    if max_threshold is None:
        return "Unknown"

    deviation = abs(value - max_threshold) / max_threshold

    if deviation < 0.1:
        return "Low ($50-200)"
    elif deviation < 0.5:
        return "Medium ($200-500)"
    else:
        return "High ($500+)"


def check_occupation_compatibility(water_data, current_occupation):
    """
    Check which other occupations this water is suitable for
    """
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



def generate_recommendations(water_data, occupation):
    """
    Main recommendation engine
    """

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
        "timestamp": datetime.utcnow().isoformat(),
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

            recommendation["violations"].append({
                "parameter": param,
                "reason": check["message"],
                "severity": "CRITICAL",
            })

        # Maximum check
        elif (
            threshold.get("max") is not None and
            value > threshold["max"]
        ):
            check["status"] = "FAIL"
            check["message"] = (
                f"Exceeds maximum ({value} > {threshold['max']})"
            )

            recommendation["violations"].append({
                "parameter": param,
                "reason": check["message"],
                "severity": "CRITICAL",
            })

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

    # ===== Treatment Recommendations =====
    for violation in recommendation["violations"]:

        param_lower = violation["parameter"].lower()

        recommended_treatment = (
            rules["treatments"].get(f"high_{param_lower}")
            or rules["treatments"].get(f"low_{param_lower}")
            or "Consult water treatment specialist"
        )

        recommendation["actionable_recommendations"].append({
            "parameter": violation["parameter"],
            "issue": violation["reason"],
            "treatment": recommended_treatment,
            "priority": (
                "URGENT (implement within 48 hours)"
                if violation["severity"] == "CRITICAL"
                else "MEDIUM (within 1 week)"
            ),
            "cost_estimate": estimate_treatment_cost(
                violation["parameter"],
                full_data.get(violation["parameter"], 0),
                rules["thresholds"][violation["parameter"]],
            ),
        })

    # ===== Overall Status =====
    if (
        len(recommendation["violations"]) == 0 and
        len(recommendation["warnings"]) == 0
    ):

        recommendation["overall_status"] = (
            "EXCELLENT - WHO Compliant"
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
            "GOOD - Minor Issues"
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
            "FAIR - Treatment Needed"
        )

    else:

        recommendation["overall_status"] = (
            "POOR - Multiple Violations, Urgent Action Required"
        )

    # ===== Compatibility Check =====
    recommendation["suitable_for_other_occupations"] = (
        check_occupation_compatibility(
            full_data,
            occupation
        )
    )

    return recommendation


def generate_dashboard_summary(recommendation):
    # Dashboard-friendly summary

    return {
        "water_quality_grade":
            recommendation["overall_status"].split(" - ")[0],

        "occupation":
            recommendation["occupation"],

        "salinity_display":
            f"{recommendation['input_parameters']['salinity_ppt']} ppt",

        "ec_display":
            f"{recommendation['input_parameters']['EC_microsiemens']} µS/cm",

        "violations_count":
            len(recommendation["violations"]),

        "warnings_count":
            len(recommendation["warnings"]),

        "primary_actions":
            recommendation["actionable_recommendations"][:2],

        "monitoring_schedule":
            recommendation["monitoring_frequency"],

        "also_suitable_for":
            recommendation["suitable_for_other_occupations"],
    }
