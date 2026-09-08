import json
from pathlib import Path


DATABASE_PATH = Path(__file__).resolve().parent.parent / "data" / "disease_database.json"


def _normalize_label(value: str) -> str:
    return " ".join((value or "").replace("_", " ").split()).title()


def get_disease_info(crop: str, disease: str):
    with open(DATABASE_PATH, "r", encoding="utf-8") as file:
        database = json.load(file)

    crop_key = _normalize_label(crop)
    disease_key = _normalize_label(disease)

    crop_data = database.get(crop_key) or database.get(crop, {})
    return crop_data.get(disease_key) or crop_data.get(disease)