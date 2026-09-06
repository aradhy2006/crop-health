import gc
import json
from pathlib import Path
import numpy as np
from PIL import Image
import tensorflow as tf

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = BASE_DIR / "trained_models" / "crop_classifier.keras"
CLASS_NAMES_PATH = BASE_DIR / "trained_models" / "crop_class_names.json"

# Lazy loading variable
_crop_model = None

def get_crop_model():
    global _crop_model
    if _crop_model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")
        _crop_model = tf.keras.models.load_model(MODEL_PATH)
    return _crop_model

def predict_crop(image: Image.Image):
    image = image.convert("RGB")
    image = image.resize((224, 224))

    image_array = np.array(image, dtype=np.float32)
    image_array = np.expand_dims(image_array, axis=0)

    # Get model on demand
    model = get_crop_model()
    predictions = model.predict(image_array, verbose=0)

    predicted_index = int(np.argmax(predictions[0]))
    confidence = float(predictions[0][predicted_index])

    with open(CLASS_NAMES_PATH, "r") as f:
        crop_class_names = json.load(f)

    # Force garbage collection to free RAM after inference
    gc.collect()

    return {
        "crop": crop_class_names[predicted_index],
        "confidence": confidence,
    }