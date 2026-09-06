import gc
from pathlib import Path
import numpy as np
from PIL import Image
import tensorflow as tf

BASE_DIR = Path(__file__).resolve().parent.parent.parent
MODEL_PATH = BASE_DIR / "trained_models" / "crop_disease_model.keras"

_disease_model = None

def get_disease_model():
    global _disease_model
    if _disease_model is None:
        if not MODEL_PATH.exists():
            raise FileNotFoundError(f"Model file not found at: {MODEL_PATH}")
        _disease_model = tf.keras.models.load_model(MODEL_PATH)
    return _disease_model

def predict_disease(image: Image.Image):
    # Obtain model lazily
    model = get_disease_model()
    
    # Add your preprocessing & prediction logic here
    # ...
    
    # Free memory after inference
    gc.collect()
    
    return {"status": "success"}  # Replace with actual prediction return