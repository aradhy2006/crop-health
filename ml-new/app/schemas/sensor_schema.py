from pydantic import BaseModel, Field
from typing import Optional


class SensorData(BaseModel):
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