import json
from pathlib import Path

import numpy as np
from PIL import Image
from ai_edge_litert.interpreter import Interpreter

from app.models.model_loader import interpreter, class_names


def predict_disease(image: Image.Image, selected_crop: str):
    image = image.convert("RGB")
    image = image.resize((224, 224))

    # Model was trained with 0-255 pixel values.
    image_array = np.array(image, dtype=np.float32)
    image_array = np.expand_dims(image_array, axis=0)

    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    interpreter.set_tensor(
        input_details[0]["index"],
        image_array
    )

    interpreter.invoke()

    predictions = interpreter.get_tensor(
        output_details[0]["index"]
    )[0]

    allowed_classes = {
        "Onion": [
            "onion_botrytis_leaf_blight",
            "onion_downy_mildew",
            "onion_healthy",
            "onion_purple_blotch"
        ],
        "Potato": [
            "potato_early_blight",
            "potato_healthy",
            "potato_late_blight"
        ],
        "Tomato": [
            "tomato_early_blight",
            "tomato_healthy",
            "tomato_late_blight",
            "tomato_leaf_mold"
        ]
    }[selected_crop]

    filtered_predictions = [
        (class_name, float(predictions[index]))
        for index, class_name in enumerate(class_names)
        if class_name in allowed_classes
    ]

    filtered_predictions.sort(
        key=lambda x: x[1],
        reverse=True
    )

    predicted_class, confidence = filtered_predictions[0]

    _, disease = predicted_class.split("_", 1)

    print("Selected crop:", selected_crop)
    print("Filtered predictions:", filtered_predictions)
    print("Predicted disease:", disease)
    print("Confidence:", confidence)

    return {
        "crop": selected_crop,
        "disease": disease.replace("_", " ").title(),
        "confidence": confidence
    }