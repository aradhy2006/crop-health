import json
from pathlib import Path
import numpy as np

from PIL import Image
import tensorflow as tf

# Resolves to the 'ml-pro' root directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent

MODEL_PATH = BASE_DIR / "trained_models" / "crop_classifier.keras"
CLASS_NAMES_PATH = BASE_DIR / "trained_models" / "crop_class_names.json"

# Check existence before loading to surface clear error messages
if not MODEL_PATH.exists():
    raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")

if not CLASS_NAMES_PATH.exists():
    raise FileNotFoundError(f"Class names file not found at: {CLASS_NAMES_PATH}")

crop_model = tf.keras.models.load_model(MODEL_PATH)

with open(CLASS_NAMES_PATH, "r") as f:
    crop_class_names = json.load(f)


def predict_crop(image: Image.Image):
    image = image.convert("RGB")
    image = image.resize((224, 224))

    image_array = np.array(image, dtype=np.float32)
    image_array = np.expand_dims(image_array, axis=0)

    predictions = crop_model.predict(image_array, verbose=0)

    predicted_index = int(np.argmax(predictions[0]))
    confidence = float(predictions[0][predicted_index])

    return {
        "crop": crop_class_names[predicted_index],
        "confidence": confidence,
    }