from app.models.crop_classifier import predict_crop
from app.models.disease_model import predict_disease as model_predict_disease
from app.services.risk_service import calculate_risk
from app.services.disease_info_service import get_disease_info


def predict_disease(image, selected_crop):
    # Step 1: Identify crop
    crop_result = predict_crop(image)
    detected_crop = crop_result["crop"]
    print("DEBUG detected_crop:", detected_crop, "selected_crop:", selected_crop)
    crop_confidence = crop_result["confidence"]

    # Step 2: Disease prediction restricted to selected crop
    if detected_crop != selected_crop:
      return {
        "error": f"Selected crop is {selected_crop}, but image appears to be {detected_crop}."
    }
    disease_result = model_predict_disease(image, selected_crop)

    disease = disease_result["disease"]
    confidence = disease_result["confidence"]

    # Step 3: Use selected crop
    result = {
        "crop": selected_crop,
        "cropConfidence": crop_confidence,
        "disease": disease,
        "confidence": confidence
    }

    # Step 4: Disease information
    disease_info = get_disease_info(selected_crop, disease)

    if disease_info:
        risk_data = calculate_risk(
            confidence,
            disease_info["spread_rate"]
        )

        result.update({
            "risk": risk_data["risk"],
            "spreadRisk": risk_data["spreadRisk"],
            "why": disease_info["why"],
            "riskConditions": disease_info["risk_conditions"],
            "solutions": disease_info["solutions"],
            "preventiveMeasures": disease_info["prevention"]
        })

    return result