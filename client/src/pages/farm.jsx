import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./farm.css";

function Farm() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        farmName: "",
        location: "",
        crop: "",
        cropVariety: "",
        cropStage: "",
        soilType: ""
    });

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");
        setLoading(true);

        try {
            const token = localStorage.getItem("token");

            const response = await api.post(
                "/farms",
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                }
            );

            setMessage(response.data.message);

            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to create farm"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="farm-page">
            <div className="farm-card">

                <h1>Add Your Farm</h1>

                <p className="farm-subtitle">
                    Enter your farm and crop information
                </p>

                {error && (
                    <div className="farm-error">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="farm-success">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="farm-form-group">
                        <label>Farm Name</label>
                        <input
                            type="text"
                            name="farmName"
                            value={formData.farmName}
                            onChange={handleChange}
                            placeholder="Enter farm name"
                            required
                        />
                    </div>

                    <div className="farm-form-group">
                        <label>Location</label>
                        <input
                            type="text"
                            name="location"
                            value={formData.location}
                            onChange={handleChange}
                            placeholder="Village / City"
                            required
                        />
                    </div>

                    <div className="farm-form-group">
                        <label>Crop</label>
                        <input
                            type="text"
                            name="crop"
                            value={formData.crop}
                            onChange={handleChange}
                            placeholder="For example: Wheat"
                            required
                        />
                    </div>

                    <div className="farm-form-group">
                        <label>Crop Variety</label>
                        <input
                            type="text"
                            name="cropVariety"
                            value={formData.cropVariety}
                            onChange={handleChange}
                            placeholder="For example: HD-2967"
                        />
                    </div>

                    <div className="farm-form-group">
                        <label>Crop Stage</label>
                        <select
                            name="cropStage"
                            value={formData.cropStage}
                            onChange={handleChange}
                            required
                        >
                            <option value="">
                                Select crop stage
                            </option>
                            <option value="Germination">
                                Germination
                            </option>
                            <option value="Vegetative">
                                Vegetative
                            </option>
                            <option value="Flowering">
                                Flowering
                            </option>
                            <option value="Fruiting">
                                Fruiting
                            </option>
                            <option value="Maturity">
                                Maturity
                            </option>
                        </select>
                    </div>

                    <div className="farm-form-group">
                        <label>Soil Type</label>
                        <select
                            name="soilType"
                            value={formData.soilType}
                            onChange={handleChange}
                        >
                            <option value="">
                                Select soil type
                            </option>
                            <option value="Loamy">Loamy</option>
                            <option value="Clay">Clay</option>
                            <option value="Sandy">Sandy</option>
                            <option value="Silty">Silty</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="farm-button"
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save Farm"}
                    </button>

                </form>

                <button
                    className="back-button"
                    onClick={() => navigate("/dashboard")}
                >
                    Back to Dashboard
                </button>

            </div>
        </div>
    );
}

export default Farm;