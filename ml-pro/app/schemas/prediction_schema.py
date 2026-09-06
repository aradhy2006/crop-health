from pydantic import BaseModel
from typing import List, Optional


class PredictionRequest(BaseModel):
    crop: str


class PredictionResponse(BaseModel):
    crop: str
    cropConfidence: Optional[float] = None
    disease: str
    confidence: float
    risk: Optional[str] = None
    spreadRisk: Optional[str] = None
    why: Optional[str] = None
    riskConditions: Optional[str] = None
    solutions: List[str] = []
    preventiveMeasures: List[str] = []
    sensorFactors: List[str] = []