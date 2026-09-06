from pydantic import BaseModel, Field
from typing import List, Optional


class ReportData(BaseModel):
    farmer_name: Optional[str] = None

    crop: str
    disease: str
    confidence: float = Field(ge=0, le=1)

    risk: str
    spreadRisk: str

    why: str
    riskConditions: str

    solutions: List[str]
    preventiveMeasures: List[str]

    temperature: Optional[float] = Field(
        default=None,
        ge=-20,
        le=60
    )

    humidity: Optional[float] = Field(
        default=None,
        ge=0,
        le=100
    )

    soil_moisture: Optional[float] = Field(
        default=None,
        ge=0,
        le=100
    )