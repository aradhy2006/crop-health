def calculate_risk(
    confidence: float,
    spread_rate: str,
    temperature: float = None,
    humidity: float = None,
    soil_moisture: float = None
):
    sensor_factors = []
    env_solutions = []
    env_prevention = []

    # Temperature factor analysis
    if temperature is not None:
        if temperature >= 40:
            sensor_factors.append(
                f"Temperature is critically high ({temperature}°C) causing severe heat stress to the crop."
            )
            env_solutions.append(
                "Install shade nets and apply overhead misting during peak daytime heat to lower canopy temperature."
            )
            env_prevention.append(
                "Apply organic straw mulch around the root zone to prevent soil overheating and moisture evaporation."
            )
        elif temperature > 30:
            sensor_factors.append(
                f"Temperature is elevated ({temperature}°C) and may cause heat stress, affecting crop growth."
            )
            env_solutions.append(
                "Increase irrigation frequency during early morning hours to mitigate heat stress."
            )
            env_prevention.append(
                "Maintain adequate vegetative canopy and soil ground cover to moderate root temperature."
            )
        elif temperature < 10:
            sensor_factors.append(
                f"Temperature is too low ({temperature}°C) and may slow crop growth or cause chilling injury."
            )
            env_solutions.append(
                "Use row covers or protective mulch to insulate plants from cold weather."
            )
            env_prevention.append(
                "Avoid late-evening cold irrigation to protect root zones from frost damage."
            )

    # Humidity factor analysis
    if humidity is not None:
        if humidity > 80:
            sensor_factors.append(
                f"Humidity is very high ({humidity}%) creating favorable conditions for fungal diseases to develop and spread."
            )
            env_solutions.append(
                "Increase plant spacing and prune lower leaves to improve airflow and lower foliage humidity."
            )
            env_prevention.append(
                "Avoid overhead irrigation; water directly at the base early in the day."
            )
        elif humidity < 30:
            sensor_factors.append(
                f"Humidity is very low ({humidity}%), which can accelerate plant dehydration and leaf wilting."
            )
            env_solutions.append(
                "Ensure timely irrigation to keep the root zone hydrated during dry air conditions."
            )

    # Soil moisture factor analysis
    if soil_moisture is not None:
        if soil_moisture > 80:
            sensor_factors.append(
                f"Soil moisture is very high ({soil_moisture}%) and may lead to waterlogging, root rot, and oxygen starvation."
            )
            env_solutions.append(
                "Temporarily halt irrigation and clear drainage channels to remove excess standing water."
            )
            env_prevention.append(
                "Plant on raised beds and ensure proper field drainage slopes during rainy periods."
            )
        elif soil_moisture < 20:
            sensor_factors.append(
                f"Soil moisture is critically low ({soil_moisture}%), indicating drought stress."
            )
            env_solutions.append(
                "Irrigate the field thoroughly to replenish root-zone moisture."
            )
            env_prevention.append(
                "Use drip irrigation systems and surface mulching to conserve soil water."
            )

    is_healthy = spread_rate.strip().lower() == "none"

    if is_healthy:
        risk = "HIGH" if len(sensor_factors) >= 2 else ("MEDIUM" if len(sensor_factors) == 1 else "LOW")
        return {
            "risk": risk,
            "spreadRisk": "None",
            "sensorFactors": sensor_factors,
            "environmentalSolutions": env_solutions,
            "environmentalPrevention": env_prevention,
        }

    # If disease is detected
    if confidence >= 0.85:
        risk_level = 3  # HIGH
    elif confidence >= 0.60:
        risk_level = 2  # MEDIUM
    else:
        risk_level = 1  # LOW

    if sensor_factors:
        risk_level += 1

    risk_level = min(risk_level, 3)

    risk_map = {3: "HIGH", 2: "MEDIUM", 1: "LOW"}
    risk = risk_map.get(risk_level, "LOW")

    return {
        "risk": risk,
        "spreadRisk": spread_rate,
        "sensorFactors": sensor_factors,
        "environmentalSolutions": env_solutions,
        "environmentalPrevention": env_prevention,
    }
