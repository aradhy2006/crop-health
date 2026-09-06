from fastapi import APIRouter, UploadFile, File, Form

from app.services.image_service import open_image
from app.services.prediction_service import predict_disease
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

        if temperature == 0:
            temperature = None

        if humidity == 0:
            humidity = None

        if soil_moisture == 0:
            soil_moisture = None

        crop = crop.strip().capitalize()

        if crop not in ["Tomato", "Potato", "Onion"]:
            return {
                "error": "Invalid crop. Choose Tomato, Potato, or Onion."
            }

        result = predict_disease(image, crop)

        if "error" in result:
            return result

        risk_data = calculate_risk(
            result["confidence"],
            result.get("spreadRisk", "Unknown"),
            temperature,
            humidity,
            soil_moisture
        )

        result["risk"] = risk_data["risk"]
        result["spreadRisk"] = risk_data["spreadRisk"]
        result["sensorFactors"] = risk_data["sensorFactors"]

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