import os

# MUST BE AT THE VERY TOP BEFORE ANY TF IMPORTS
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '3'
os.environ['OMP_NUM_THREADS'] = '1'
os.environ['TF_NUM_INTRAOP_THREADS'] = '1'
os.environ['TF_NUM_INTEROP_THREADS'] = '1'

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.health import router as health_router
from app.api.routes.prediction import router as prediction_router

app = FastAPI(
    title="Crop Disease Detection API",
    description="AI-based crop disease detection and risk analysis API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"status": "online", "message": "Crop Disease Detection API is running"}

app.include_router(health_router, tags=["Health"])
app.include_router(prediction_router, prefix="/prediction", tags=["Prediction"])