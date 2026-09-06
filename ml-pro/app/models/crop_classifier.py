from pathlib import Path
import json
import numpy as np
import tensorflow as tf
from PIL import Image

MODEL_PATH = Path("trained_models/crop_classifier.keras")
CLASS_NAMES_PATH = Path("trained_models/crop_class_names.json")

crop_model = tf.keras.models.load_model(MODEL_PATH)

with open(CLASS_NAMES_PATH, "r") as f:
    crop_class_names = json.load(f)


def predict_crop(image: Image.Image):
    image = image.convert("RGB")
    image = image.resize((224, 224))

    # Crop classifier also has a Rescaling(1./255) layer.
    image_array = np.array(image, dtype=np.float32)
    image_array = np.expand_dims(image_array, axis=0)

    predictions = crop_model.predict(image_array, verbose=0)

    predicted_index = int(np.argmax(predictions[0]))
    confidence = float(predictions[0][predicted_index])

    return {
        "crop": crop_class_names[predicted_index],
        "confidence": confidence
    }