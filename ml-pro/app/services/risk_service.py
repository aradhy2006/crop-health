def calculate_risk(
    confidence: float,
    spread_rate: str,
    temperature: float = None,
    humidity: float = None,
    soil_moisture: float = None
):
    # Base risk from AI confidence
    if confidence >= 0.85:
        risk_level = 3  # HIGH
    elif confidence >= 0.60:
        risk_level = 2  # MEDIUM
    else:
        risk_level = 1  # LOW

    sensor_factors = []

    # Sensor conditions
    if temperature is not None:
        if temperature > 30:
            sensor_factors.append("High temperature")
        elif temperature < 10:
            sensor_factors.append("Low temperature")

    if humidity is not None and humidity > 80:
        sensor_factors.append("High humidity")

    if soil_moisture is not None and soil_moisture > 80:
        sensor_factors.append("High soil moisture")

    # Increase risk when environmental conditions are unfavorable
    if sensor_factors:
        risk_level += 1

    # Maximum risk = HIGH
    risk_level = min(risk_level, 3)

    if risk_level == 3:
        risk = "HIGH"
    elif risk_level == 2:
        risk = "MEDIUM"
    else:
        risk = "LOW"

    return {
        "risk": risk,
        "spreadRisk": spread_rate,
        "sensorFactors": sensor_factors
    }