import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import api from "../services/api";
import farmService from "../services/farmservice";

import "./farm.css";

function Farm() {
    const navigate = useNavigate();
    const { farmId } = useParams();

    const isEditMode = Boolean(farmId);

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
    const [loadingFarm, setLoadingFarm] = useState(isEditMode);

    useEffect(() => {
        if (!isEditMode) {
            return;
        }

        const loadFarm = async () => {
            try {
                const response = await farmService.getMyFarms();

                const farm = response.farms?.find(
                    (item) => item._id === farmId
                );

                if (!farm) {
                    setError("Farm not found");
                    return;
                }

                setFormData({
                    farmName: farm.farmName || "",
                    location: farm.location || "",
                    crop: farm.crop || "",
                    cropVariety: farm.cropVariety || "",
                    cropStage: farm.cropStage || "",
                    soilType: farm.soilType || ""
                });
            } catch (error) {
                console.error("Unable to load farm:", error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load farm"
                );
            } finally {
                setLoadingFarm(false);
            }
        };

        loadFarm();
    }, [farmId, isEditMode]);

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
            let response;

            if (isEditMode) {
                response = await farmService.updateFarm(
                    farmId,
                    formData
                );
            } else {
                const token = localStorage.getItem("token");

                response = await api.post(
                    "/farms",
                    formData,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    }
                );

                response = response.data;
            }

            setMessage(response.message);

            setTimeout(() => {
                navigate("/dashboard");
            }, 1000);

        } catch (error) {
            console.error("Unable to save farm:", error);

            setError(
                error.response?.data?.message ||
                "Unable to save farm"
            );
        } finally {
            setLoading(false);
        }
    };

    if (loadingFarm) {
        return (
            <div className="farm-page">
                <div className="farm-card">
                    <h1>Loading Farm...</h1>
                    <p className="farm-subtitle">
                        Please wait while we load your farm details.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="farm-page">
            <div className="farm-card">

                <h1>
                    {isEditMode
                        ? "Edit Your Farm"
                        : "Add Your Farm"}
                </h1>

                <p className="farm-subtitle">
                    {isEditMode
                        ? "Update your farm and crop information"
                        : "Enter your farm and crop information"}
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

                            <option value="Loamy">
                                Loamy
                            </option>

                            <option value="Clay">
                                Clay
                            </option>

                            <option value="Sandy">
                                Sandy
                            </option>

                            <option value="Silty">
                                Silty
                            </option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="farm-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Saving..."
                            : isEditMode
                                ? "Update Farm"
                                : "Save Farm"}
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