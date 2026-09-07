import gc
import json
from pathlib import Path
import numpy as np
from PIL import Image
from ai_edge_litert.interpreter import Interpreter

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = BASE_DIR / "trained_models" / "crop_disease_model.tflite"
CLASS_NAMES_PATH = BASE_DIR / "trained_models" / "class_names.json"

_interpreter = None

def get_interpreter():
    global _interpreter
    if _interpreter is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"TFLite disease model not found at: {MODEL_PATH}")
        _interpreter = Interpreter(model_path=str(MODEL_PATH))   # was: tflite.Interpreter(...)
        _interpreter.allocate_tensors()
    return _interpreter

def predict_disease(image: Image.Image, crop: str = None, **kwargs):
    image = image.convert("RGB").resize((224, 224))
    image_array = np.array(image, dtype=np.float32)
    image_array = np.expand_dims(image_array, axis=0)

    interpreter = get_interpreter()
    input_details = interpreter.get_input_details()
    output_details = interpreter.get_output_details()

    interpreter.set_tensor(input_details[0]['index'], image_array)
    interpreter.invoke()
    predictions = interpreter.get_tensor(output_details[0]['index'])

    predicted_index = int(np.argmax(predictions[0]))
    confidence = float(predictions[0][predicted_index])

    disease_class_names = []
    if CLASS_NAMES_PATH.exists():
        with open(CLASS_NAMES_PATH, "r") as f:
            disease_class_names = json.load(f)

    disease_name = (
        disease_class_names[predicted_index]
        if disease_class_names and predicted_index < len(disease_class_names)
        else f"Disease_{predicted_index}"
    )

    gc.collect()

    return {
        "crop": crop,
        "disease": disease_name,
        "confidence": confidence,
    }