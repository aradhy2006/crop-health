import json
from pathlib import Path

try:
    from ai_edge_litert.interpreter import Interpreter
except ImportError:
    try:
        from tflite_runtime.interpreter import Interpreter
    except ImportError:
        from tensorflow.lite.python.interpreter import Interpreter


BASE_DIR = Path(__file__).resolve().parent.parent.parent

MODEL_PATH = BASE_DIR / "trained_models" / "crop_disease_model.tflite"
CLASS_NAMES_PATH = BASE_DIR / "trained_models" / "class_names.json"


interpreter = Interpreter(model_path=str(MODEL_PATH))
interpreter.allocate_tensors()


with open(CLASS_NAMES_PATH, "r", encoding="utf-8") as f:
    class_names = json.load(f)


print("TFLite disease model loaded successfully!")
print("Classes:", class_names)
