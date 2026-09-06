import json
from pathlib import Path


DATABASE_PATH = Path(__file__).resolve().parent.parent / "data" / "disease_database.json"


def get_disease_info(crop: str, disease: str):
    with open(DATABASE_PATH, "r", encoding="utf-8") as file:
        database = json.load(file)

    crop_data = database.get(crop, {})
    return crop_data.get(disease)