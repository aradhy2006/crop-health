import numpy as np
from PIL import Image
from app.models.model_loader import model, class_names


CROP_CLASS_RANGES = {
    "Onion": ["onion_botrytis_leaf_blight", "onion_downy_mildew", "onion_healthy", "onion_purple_blotch"],
    "Potato": ["potato_early_blight", "potato_healthy", "potato_late_blight"],
    "Tomato": ["tomato_early_blight", "tomato_healthy", "tomato_late_blight", "tomato_leaf_mold"]
}


def predict_disease(image: Image.Image, selected_crop: str):
    image = image.convert("RGB")
    image = image.resize((224, 224))

    # Model already includes Rescaling(1./255). Training used
    # image_dataset_from_directory pixels in 0-255, so do not divide here.
    image_array = np.array(image, dtype=np.float32)
    image_array = np.expand_dims(image_array, axis=0)

    predictions = model.predict(image_array, verbose=0)[0]

    allowed_classes = CROP_CLASS_RANGES[selected_crop]

    filtered_predictions = [
        (class_name, float(predictions[index]))
        for index, class_name in enumerate(class_names)
        if class_name in allowed_classes
    ]

    filtered_predictions.sort(key=lambda x: x[1], reverse=True)
    total_probability = sum(probability for _, probability in filtered_predictions)
    print("Selected crop:", selected_crop)
    print("Filtered predictions:", filtered_predictions)

    predicted_class, original_confidence = filtered_predictions[0]
    confidence = original_confidence / total_probability

    _, disease = predicted_class.split("_", 1)

    return {
        "crop": selected_crop,
        "disease": disease.replace("_", " ").title(),
        "confidence": confidence
    }