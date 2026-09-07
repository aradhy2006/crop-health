import React, { useState } from "react";
import { predictCropDisease } from "../services/predictionservice";

export default function PredictForm() {
  const [file, setFile] = useState(null);
  const [crop, setCrop] = useState("potato");
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setErrorMsg("Please select an image file first.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setPrediction(null);

    try {
      const result = await predictCropDisease({
        file: file,
        crop: crop,
        temperature: 25,
        humidity: 80,
        soilMoisture: 30,
      });

      setPrediction(result);
    } catch (err) {
      
      const detail = err.response?.data?.detail || err.message || "Failed to make prediction";
      setErrorMsg(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input 
          type="file" 
          accept="image/*" 
          onChange={(e) => setFile(e.target.files[0])} 
        />
        <button type="submit" disabled={loading}>
          {loading ? "Analyzing image..." : "Get Prediction"}
        </button>
      </form>

      {errorMsg && <p style={{ color: "red" }}>{errorMsg}</p>}

      {prediction && (
        <div>
          <h3>Results:</h3>
          <p>Crop: {prediction.crop}</p>
          <p>Disease: {prediction.disease}</p>
          <p>Confidence: {(prediction.confidence * 100).toFixed(1)}%</p>
        </div>
      )}
    </div>
  );
}