from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes.health import router as health_router
from app.api.routes.prediction import router as prediction_router

app = FastAPI(
    title="Crop Disease Detection API",
    description="AI-based crop disease detection and risk analysis API",
    version="1.0.0",
)

# Enable CORS for cross-origin requests from Vercel and local development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with specific Vercel URL in strict production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {
        "status": "online",
        "message": "Crop Disease Detection API is running"
    }


# Include application routes
app.include_router(
    health_router,
    tags=["Health"]
)

app.include_router(
    prediction_router,
    prefix="/prediction",
    tags=["Prediction"]
)