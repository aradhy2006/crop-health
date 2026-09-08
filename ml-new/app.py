from fastapi import FastAPI, UploadFile, File
import joblib # or tensorflow / torch
import numpy as np

app = FastAPI()

# Load saved model once at startup
model = joblib.load("crop_model.pkl")

@app.get("/")
def home():
    return {"status": "ML API is running"}

@app.post("/predict")
async def predict(data: dict):
    # Process features from request body
    features = np.array([data["features"]])
    prediction = model.predict(features)
    return {"prediction": prediction.tolist()}