import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import diseaseService from "../services/diseaseservice";
import farmService from "../services/farmservice";

import "./DiseaseDetection.css";

function DiseaseDetection() {
    const navigate = useNavigate();

    const [farm, setFarm] = useState(null);
    const [farmLoading, setFarmLoading] = useState(true);

    const [formData, setFormData] = useState({
        temperature: "",
        humidity: "",
        soilMoisture: ""
    });

    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState("");
    const [report, setReport] = useState(null);

    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Load the logged-in farmer's farm
    useEffect(() => {
        const loadFarm = async () => {
            try {
                const response = await farmService.getMyFarms();

                if (response.farms && response.farms.length > 0) {
                    setFarm(response.farms[0]);
                } else {
                    setError("No farm found. Please add a farm first.");
                }
            } catch (error) {
                console.error("Unable to load farm:", error);
                setError("Unable to load your farm.");
            } finally {
                setFarmLoading(false);
            }
        };

        loadFarm();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

    const handleImageChange = (event) => {
        const selectedImage = event.target.files[0];

        if (!selectedImage) {
            return;
        }

        setImage(selectedImage);
        setPreview(URL.createObjectURL(selectedImage));
        setError("");
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setReport(null);

        if (!farm) {
            setError("Please add a farm before analyzing your crop.");
            return;
        }

        if (!image) {
            setError("Please select a crop image.");
            return;
        }

        setLoading(true);

        try {
            const data = new FormData();

            // Image
            data.append("image", image);

            // Automatically loaded farm data
            data.append("farmId", farm._id);
            data.append("crop", farm.crop);

            // Sensor data
            data.append("temperature", formData.temperature);
            data.append("humidity", formData.humidity);
            data.append("soilMoisture", formData.soilMoisture);

            const response =
                await diseaseService.analyzeDisease(data);

            setReport(response.report);

        } catch (error) {
            console.error("Disease analysis error:", error);

            setError(
                error.response?.data?.message ||
                "Unable to analyze the crop."
            );
        } finally {
            setLoading(false);
        }
    };

    const handleNewAnalysis = () => {
        setReport(null);
        setImage(null);
        setPreview("");

        setFormData({
            temperature: "",
            humidity: "",
            soilMoisture: ""
        });

        setError("");
    };

    return (
        <div className="disease-page">

            <div className="disease-card">

                <button
                    className="back-button"
                    onClick={() => navigate("/dashboard")}
                >
                    ← Back to Dashboard
                </button>

                <div className="disease-header">
                    <h1>Crop Disease Detection</h1>

                    <p>
                        Upload a crop image and provide environmental
                        data to analyze your crop.
                    </p>
                </div>

                {error && (
                    <div className="disease-error">
                        {error}
                    </div>
                )}

                {!report ? (
                    <form onSubmit={handleSubmit}>

                        {/* Farm information */}
                        <div className="farm-preview">

                            {farmLoading ? (
                                <p>Loading farm information...</p>
                            ) : farm ? (
                                <>
                                    <h3>Selected Farm</h3>

                                    <p>
                                        <strong>Farm:</strong>{" "}
                                        {farm.farmName}
                                    </p>

                                    <p>
                                        <strong>Crop:</strong>{" "}
                                        {farm.crop}
                                    </p>

                                    <p>
                                        <strong>Location:</strong>{" "}
                                        {farm.location}
                                    </p>

                                    <p>
                                        <strong>Crop Stage:</strong>{" "}
                                        {farm.cropStage}
                                    </p>
                                </>
                            ) : (
                                <p>
                                    No farm found. Please add a farm first.
                                </p>
                            )}

                        </div>

                        {/* Sensor values */}
                        <div className="sensor-input-grid">

                            <div className="disease-form-group">
                                <label>
                                    Temperature (°C)
                                </label>

                                <input
                                    type="number"
                                    name="temperature"
                                    value={formData.temperature}
                                    onChange={handleChange}
                                    placeholder="28.5"
                                    step="0.1"
                                />
                            </div>

                            <div className="disease-form-group">
                                <label>
                                    Humidity (%)
                                </label>

                                <input
                                    type="number"
                                    name="humidity"
                                    value={formData.humidity}
                                    onChange={handleChange}
                                    placeholder="82"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                />
                            </div>

                            <div className="disease-form-group">
                                <label>
                                    Soil Moisture (%)
                                </label>

                                <input
                                    type="number"
                                    name="soilMoisture"
                                    value={formData.soilMoisture}
                                    onChange={handleChange}
                                    placeholder="56"
                                    min="0"
                                    max="100"
                                    step="0.1"
                                />
                            </div>

                        </div>

                        {/* Image Upload */}
                        <div className="upload-section">

                            <label className="upload-box">

                                {preview ? (
                                    <img
                                        src={preview}
                                        alt="Crop preview"
                                        className="image-preview"
                                    />
                                ) : (
                                    <>
                                        <div className="upload-icon">
                                            📷
                                        </div>

                                        <h3>
                                            Upload Crop Image
                                        </h3>

                                        <p>
                                            Click here to select an image
                                        </p>

                                        <span>
                                            JPG, JPEG or PNG
                                        </span>
                                    </>
                                )}

                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/jpg"
                                    onChange={handleImageChange}
                                    hidden
                                />

                            </label>

                        </div>

                        <button
                            type="submit"
                            className="analyze-button"
                            disabled={loading || farmLoading || !farm}
                        >
                            {loading
                                ? "Analyzing..."
                                : "🔍 Analyze Crop"}
                        </button>

                    </form>
                ) : (

                    /* Report */
                    <div className="result-section">

                        <h2>Crop Health Report</h2>

                        <div className="result-image">
                            <img
                                src={preview}
                                alt="Analyzed crop"
                            />
                        </div>

                        <div className="result-main">

                            <p>
                                <strong>Crop:</strong>{" "}
                                {report.crop}
                            </p>

                            <p>
                                <strong>Detected Disease:</strong>{" "}
                                {report.disease}
                            </p>

                            <p>
                                <strong>Confidence:</strong>{" "}
                                {report.confidence}%
                            </p>

                            <p>
                                <strong>Risk Level:</strong>{" "}
                                {report.riskLevel}
                            </p>

                        </div>

                        <div className="report-block">
                            <h3>Why does it happen?</h3>

                            <p>
                                {report.whyItHappens}
                            </p>
                        </div>

                        <div className="report-block">
                            <h3>Expected Spread</h3>

                            <p>
                                {report.expectedSpread}
                            </p>
                        </div>

                        <div className="report-block">
                            <h3>Solution</h3>

                            <p>
                                {report.solution}
                            </p>
                        </div>

                        <div className="report-block">

                            <h3>Prevention</h3>

                            <ul>
                                {report.prevention?.map(
                                    (item, index) => (
                                        <li key={index}>
                                            {item}
                                        </li>
                                    )
                                )}
                            </ul>

                        </div>

                        <div className="report-block">

                            <h3>Sensor Readings</h3>

                            <div className="sensor-results">

                                <p>
                                    <strong>
                                        Temperature:
                                    </strong>{" "}
                                    {report.sensorReadings?.temperature ?? "--"} °C
                                </p>

                                <p>
                                    <strong>
                                        Humidity:
                                    </strong>{" "}
                                    {report.sensorReadings?.humidity ?? "--"} %
                                </p>

                                <p>
                                    <strong>
                                        Soil Moisture:
                                    </strong>{" "}
                                    {report.sensorReadings?.soilMoisture ?? "--"} %
                                </p>

                            </div>

                        </div>

                        <button
                            className="new-analysis-button"
                            onClick={handleNewAnalysis}
                        >
                            Analyze Another Crop
                        </button>

                    </div>
                )}

            </div>

        </div>
    );
}

export default DiseaseDetection;