def calculate_risk(
    confidence: float,
    spread_rate: str,
    temperature: float = None,
    humidity: float = None,
    soil_moisture: float = None
):
    # Healthy crop/disease-free condition
    # should not be marked as disease risk.
    if spread_rate.strip().lower() == "none":
        sensor_factors = []

        # Even for healthy crops, warn about extreme sensor conditions.
        if temperature is not None:
            if temperature > 30:
                sensor_factors.append(
                    "Temperature is too high and may cause heat stress, "
                    "which can affect crop growth and plant health."
                )
            elif temperature < 10:
                sensor_factors.append(
                    "Temperature is too low and may slow crop growth "
                    "and affect overall plant health."
                )

        if humidity is not None and humidity > 80:
            sensor_factors.append(
                "Humidity is too high and may create favorable conditions "
                "for fungal diseases to develop and spread."
            )

        if soil_moisture is not None and soil_moisture > 80:
            sensor_factors.append(
                "Soil moisture is too high and may lead to waterlogging, "
                "root problems, and reduced crop health."
            )

        return {
            "risk": "LOW",
            "spreadRisk": "None",
            "sensorFactors": sensor_factors
        }

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
            sensor_factors.append(
                "Temperature is too high and may cause heat stress, "
                "which can affect crop growth and plant health."
            )
        elif temperature < 10:
            sensor_factors.append(
                "Temperature is too low and may slow crop growth "
                "and affect overall plant health."
            )

    if humidity is not None and humidity > 80:
        sensor_factors.append(
            "Humidity is too high and may create favorable conditions "
            "for fungal diseases to develop and spread."
        )

    if soil_moisture is not None and soil_moisture > 80:
        sensor_factors.append(
            "Soil moisture is too high and may lead to waterlogging, "
            "root problems, and reduced crop health."
        )

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