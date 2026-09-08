import gc
import json
from pathlib import Path
import numpy as np
from PIL import Image
from ai_edge_litert.interpreter import Interpreter

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = BASE_DIR / "trained_models" / "crop_disease_model.tflite"
CLASS_NAMES_PATH = BASE_DIR / "trained_models" / "class_names.json"

CROP_CLASS_RANGES = {
    "Onion": [
        "onion_botrytis_leaf_blight",
        "onion_downy_mildew",
        "onion_healthy",
        "onion_purple_blotch",
    ],
    "Potato": [
        "potato_early_blight",
        "potato_healthy",
        "potato_late_blight",
    ],
    "Tomato": [
        "tomato_early_blight",
        "tomato_healthy",
        "tomato_late_blight",
        "tomato_leaf_mold",
    ],
}

_interpreter = None
_class_names = None


def get_class_names():
    global _class_names
    if _class_names is None:
        if not CLASS_NAMES_PATH.exists():
            raise FileNotFoundError(
                f"Disease class names not found at: {CLASS_NAMES_PATH}"
            )
        with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as file:
            _class_names = json.load(file)
    return _class_names


def get_interpreter():
    global _interpreter
    if _interpreter is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(
                f"TFLite disease model not found at: {MODEL_PATH}"
            )
        _interpreter = Interpreter(model_path=str(MODEL_PATH))
        _interpreter.allocate_tensors()
    return _interpreter


def _format_disease_name(class_name: str) -> str:
    _, disease = class_name.split("_", 1)
    return disease.replace("_", " ").title()


def predict_disease(image: Image.Image, crop: str = None, **kwargs):
    class_names = get_class_names()
    selected_crop = (crop or "").strip().capitalize()

    if selected_crop not in CROP_CLASS_RANGES:
        return {
            "error": "Invalid crop. Choose Tomato, Potato, or Onion."
        }

    image = image.convert("RGB").resize((224, 224))
    interpreter = get_interpreter()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    input_dtype = input_details[0]["dtype"]
    if np.issubdtype(input_dtype, np.floating) or input_dtype == np.uint8:
        pixel_array = np.array(image, dtype=input_dtype)
    else:
        pixel_array = np.array(image, dtype=np.float32)
    image_array = np.expand_dims(pixel_array, axis=0)

    interpreter.set_tensor(input_details[0]["index"], image_array)
    interpreter.invoke()
    predictions = interpreter.get_tensor(output_details[0]["index"])[0]
    print("INPUT DTYPE:", input_dtype)
    print("INPUT DETAILS:", input_details[0])
    print("RAW PREDICTIONS:", predictions)
    print("CLASS NAMES:", class_names)

    allowed_classes = CROP_CLASS_RANGES[selected_crop]
    filtered_predictions = [
        (class_name, float(predictions[index]))
        for index, class_name in enumerate(class_names)
        if class_name in allowed_classes
    ]

    if not filtered_predictions:
        return {
            "error": "Disease detection failed: no matching class for this crop."
        }

    filtered_predictions.sort(key=lambda item: item[1], reverse=True)
    total_probability = sum(probability for _, probability in filtered_predictions)
    predicted_class, original_confidence = filtered_predictions[0]
    confidence = (
        original_confidence / total_probability
        if total_probability > 0
        else original_confidence
    )

    gc.collect()

    return {
        "crop": selected_crop,
        "disease": _format_disease_name(predicted_class),
        "confidence": confidence,
    }
