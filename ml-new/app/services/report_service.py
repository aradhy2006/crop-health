from app.schemas.report_schema import ReportData


def create_report(data: ReportData):
    return {
        "farmer_name": data.farmer_name,
        "crop": data.crop,
        "disease": data.disease,
        "confidence": data.confidence,
        "risk": data.risk,
        "spreadRisk": data.spreadRisk,
        "why": data.why,
        "riskConditions": data.riskConditions,
        "solutions": data.solutions,
        "preventiveMeasures": data.preventiveMeasures,
        "sensorData": {
            "temperature": data.temperature,
            "humidity": data.humidity,
            "soil_moisture": data.soil_moisture
        }
    }