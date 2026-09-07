import gc
import json
from pathlib import Path
import numpy as np
from PIL import Image
import tensorflow as tf

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = BASE_DIR / "trained_models" / "crop_disease_model.keras"
CLASS_NAMES_PATH = BASE_DIR / "trained_models" / "disease_class_names.json"  # or your json path

_disease_model = None


def get_disease_model():
    global _disease_model
    if _disease_model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")
        _disease_model = tf.keras.models.load_model(MODEL_PATH)
    return _disease_model


def predict_disease(image: Image.Image, crop: str = None, **kwargs):
    """Predicts disease from leaf image.

    Accepts 'crop' and optional extra params from the route.
    """
    image = image.convert("RGB")
    image = image.resize((224, 224))

    image_array = np.array(image, dtype=np.float32)
    image_array = np.expand_dims(image_array, axis=0)

    # Get model on demand (lazy loading)
    model = get_disease_model()
    predictions = model.predict(image_array, verbose=0)

    predicted_index = int(np.argmax(predictions[0]))
    confidence = float(predictions[0][predicted_index])

    # Clean up memory after inference
    gc.collect()

    return {
        "crop": crop,
        "predicted_class_index": predicted_index,
        "confidence": confidence,
    }