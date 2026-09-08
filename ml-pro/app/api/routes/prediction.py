from fastapi import APIRouter, UploadFile, File, Form

from app.services.image_service import open_image
from app.services.prediction_service import predict_disease
from app.services.disease_info_service import get_disease_info
from app.services.risk_service import calculate_risk

router = APIRouter()


@router.get("/test")
def prediction_test():
    return {
        "message": "Prediction route is working"
    }


@router.post("/predict")
async def predict(
    file: UploadFile = File(...),
    crop: str = Form(...),
    temperature: float | None = Form(None),
    humidity: float | None = Form(None),
    soil_moisture: float | None = Form(None)
):
    try:
        image_bytes = await file.read()
        image = open_image(image_bytes)

        # Treat 0 as missing sensor data
        if temperature == 0:
            temperature = None

        if humidity == 0:
            humidity = None

        if soil_moisture == 0:
            soil_moisture = None

        # Normalize crop name
        crop = crop.strip().capitalize()

        if crop not in ["Tomato", "Potato", "Onion"]:
            return {
                "error": "Invalid crop. Choose Tomato, Potato, or Onion."
            }

        # AI disease prediction
        result = predict_disease(image, crop)

        if "error" in result:
            return result

        # Disease information
        disease_info = get_disease_info(
            result["crop"],
            result["disease"]
        ) or {}

        result["why"] = disease_info.get(
            "why",
            ""
        )

        result["solutions"] = disease_info.get(
            "solutions",
            []
        )

        result["preventiveMeasures"] = disease_info.get(
            "prevention",
            []
        )

        # Risk calculation using disease + sensor data
        risk_data = calculate_risk(
            result["confidence"],
            disease_info.get(
                "spread_rate",
                "Unknown"
            ),
            temperature,
            humidity,
            soil_moisture
        )

        result["risk"] = risk_data["risk"]
        result["spreadRisk"] = risk_data["spreadRisk"]

        # Detailed sensor warnings
        result["sensorFactors"] = risk_data["sensorFactors"]

        # Merge disease solutions with environmental solutions
        solutions = list(disease_info.get("solutions", []))
        for env_sol in risk_data.get("environmentalSolutions", []):
            if env_sol not in solutions:
                solutions.append(env_sol)
        result["solutions"] = solutions

        # Merge disease prevention with environmental prevention
        preventive_measures = list(disease_info.get("prevention", []))
        for env_prev in risk_data.get("environmentalPrevention", []):
            if env_prev not in preventive_measures:
                preventive_measures.append(env_prev)
        result["preventiveMeasures"] = preventive_measures

        # Risk conditions
        if risk_data["sensorFactors"]:
            result["riskConditions"] = (
                "Current environmental conditions are not "
                "favorable for overall crop health."
            )
        else:
            result["riskConditions"] = disease_info.get(
                "risk_conditions",
                ""
            )

        # Sensor readings
        result["sensorData"] = {
            "temperature": temperature,
            "humidity": humidity,
            "soil_moisture": soil_moisture
        }

        return result

    except Exception as e:
        return {
            "error": "Prediction failed",
            "detail": str(e),
            "error_type": type(e).__name__
        }
