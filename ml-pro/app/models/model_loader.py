from pathlib import Path
import json
import tensorflow as tf


MODEL_PATH = Path("trained_models/crop_disease_model.keras")
CLASS_NAMES_PATH = Path("trained_models/class_names.json")


model = tf.keras.models.load_model(MODEL_PATH)

with open(CLASS_NAMES_PATH, "r") as f:
    class_names = json.load(f)

print("Disease model loaded successfully!")
print("Classes:", class_names)