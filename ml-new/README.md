# Crop Disease Detection ML API

AI-based crop disease detection and risk analysis system for **Tomato, Potato, and Onion**.

## Project Overview

This project uses a TensorFlow/Keras deep learning model to detect crop diseases from leaf images.

The ML backend is built with **FastAPI** and is designed for integration with a MERN-based farmer application.

### Supported Crops

- Tomato
- Potato
- Onion

### System Features

- Crop identification
- Disease detection from leaf images
- Disease prediction confidence
- Disease risk analysis
- Disease spread-risk information
- Disease causes
- Risk conditions
- Possible solutions
- Preventive measures
- Temperature sensor input
- Humidity sensor input
- Soil-moisture sensor input
- Sensor-based risk factors
- JSON API response for MERN integration

## Supported Diseases

### Tomato

- Healthy
- Early Blight
- Late Blight
- Leaf Mold

### Potato

- Healthy
- Early Blight
- Late Blight

### Onion

- Healthy
- Downy Mildew
- Purple Blotch
- Botrytis Leaf Blight

**Total classes: 11**

## Machine Learning

The disease detection model is a TensorFlow/Keras CNN.

### Input

```text
224 x 224 RGB image
```

### Disease Classes

```text
11
```

### Disease Model

```text
trained_models/crop_disease_model.keras
```

### Class Names

```text
trained_models/class_names.json
```

A separate crop classifier is also included:

```text
trained_models/crop_classifier.keras
trained_models/crop_class_names.json
```

## Dataset

The project uses image datasets for Tomato, Potato, and Onion.

Dataset split:

```text
70% Training
15% Validation
15% Testing
```

The processed dataset contains:

```text
data/
├── raw/
└── processed/
    ├── train/
    ├── validation/
    └── test/
```

Raw and processed datasets are excluded from Git using `.gitignore`.

## Model Evaluation

The final 11-class disease model achieved approximately:

```text
Validation Accuracy: 79.77%
Test Accuracy:       80.76%
```

The model contains 11 disease/healthy classes across three crops.

## API

### Start the server

```bash
python -m uvicorn app.main:app --reload
```

### API Root

```text
http://127.0.0.1:8000
```

### Swagger Documentation

```text
http://127.0.0.1:8000/docs
```

## Endpoints

### GET `/`

Returns API status.

Example:

```json
{
  "message": "Crop Disease Detection API is running"
}
```

### GET `/health`

Health check endpoint.

Example:

```json
{
  "status": "healthy"
}
```

### GET `/prediction/test`

Checks whether the prediction route is working.

### POST `/prediction/predict`

Accepts:

- Leaf image
- Crop name
- Temperature
- Humidity
- Soil moisture

Example response:

```json
{
  "crop": "Potato",
  "cropConfidence": 0.9976,
  "disease": "Late Blight",
  "confidence": 0.9949,
  "risk": "HIGH",
  "spreadRisk": "Very High",
  "why": "Caused by Phytophthora infestans and can spread rapidly under cool and wet conditions.",
  "riskConditions": "Cool weather, rain, high humidity and prolonged leaf wetness.",
  "solutions": [
    "Remove heavily infected plant material.",
    "Improve field drainage and ventilation.",
    "Use appropriate fungicide according to local agricultural guidance."
  ],
  "preventiveMeasures": [
    "Use disease-free planting material.",
    "Monitor fields frequently during wet weather.",
    "Remove infected debris."
  ],
  "sensorFactors": [],
  "sensorData": {
    "temperature": 25,
    "humidity": 50,
    "soil_moisture": 50
  }
}
```

## Sensor Integration

The API accepts three environmental sensor values:

```text
Temperature
Humidity
Soil Moisture
```

The sensor flow is:

```text
Hardware Sensors
       ↓
MERN / API Request
       ↓
FastAPI
       ↓
Sensor Data
       ↓
Risk Service
       ↓
Sensor Risk Factors
       ↓
JSON Response
```

Example:

```text
Temperature = 25°C
Humidity = 85%
Soil Moisture = 85%
```

The API identifies:

```text
High humidity
High soil moisture
```

and incorporates these factors into risk analysis.

## Disease Information

Disease information is stored in:

```text
app/data/disease_database.json
```

Crop information is stored in:

```text
app/data/crop_database.json
```

## Project Structure

```text
crop-disease-ml/
├── app/
│   ├── __init__.py
│   ├── main.py
│   │
│   ├── api/
│   │   ├── __init__.py
│   │   └── routes/
│   │       ├── __init__.py
│   │       ├── health.py
│   │       └── prediction.py
│   │
│   ├── models/
│   │   ├── __init__.py
│   │   ├── disease_model.py
│   │   ├── model_loader.py
│   │   └── crop_classifier.py
│   │
│   ├── services/
│   │   ├── __init__.py
│   │   ├── image_service.py
│   │   ├── prediction_service.py
│   │   ├── risk_service.py
│   │   ├── disease_info_service.py
│   │   └── report_service.py
│   │
│   ├── schemas/
│   │   ├── __init__.py
│   │   ├── prediction_schema.py
│   │   ├── sensor_schema.py
│   │   └── report_schema.py
│   │
│   ├── utils/
│   │   ├── __init__.py
│   │   ├── image_preprocessor.py
│   │   └── constants.py
│   │
│   └── data/
│       ├── disease_database.json
│       └── crop_database.json
│
├── data/
│   ├── raw/
│   └── processed/
│
├── trained_models/
│   ├── crop_disease_model.keras
│   ├── crop_disease_model_classweighted_backup.keras
│   ├── class_names.json
│   ├── crop_classifier.keras
│   ├── crop_class_names.json
│   ├── evaluation_results.json
│   └── classification_repot.json
│
├── notebooks/
│   ├── 01_dataset_analysis.ipynb
│   ├── 02_data_preprocessing.ipynb
│   ├── 03_model_training.ipynb
│   ├── 04_model_evaluation.ipynb
│   └── 05_crop_classifier.ipynb
│
├── tests/
│   ├── test_prediction.py
│   ├── test_image_processing.py
│   └── test_api.py
│
├── requirements.txt
├── .env
├── .gitignore
└── README.md
```

## Testing

Run:

```bash
python -m pytest
```

Current test result:

```text
5 passed
```

## Technology Stack

```text
Python 3.12.6
TensorFlow 2.21.0
FastAPI
Uvicorn
Pillow
NumPy
Pandas
Scikit-learn
Pytest
```

## MERN Integration Flow

```text
Farmer
   ↓
MERN Frontend
   ↓
Image Upload + Crop + Sensor Data
   ↓
FastAPI ML API
   ↓
Crop Detection
   ↓
Disease Detection
   ↓
Risk Analysis
   ↓
Disease Information
   ↓
JSON Response
   ↓
MERN Frontend
   ↓
Farmer
```

## Important Note

The trained `.keras` model files are excluded from Git by `.gitignore` in the current project configuration. The model files must therefore be available on the machine running the ML API.

## Project Status

Core ML backend functionality has been implemented and tested.

```text
Disease Detection       ✓
Crop Classification     ✓
Risk Analysis           ✓
Sensor Input            ✓
Disease Information     ✓
FastAPI                 ✓
Swagger API             ✓
Automated Tests         ✓
MERN Integration Ready  ✓
```
