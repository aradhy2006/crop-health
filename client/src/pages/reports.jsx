import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import diseaseService from "../services/diseaseservice";

import "./reports.css";

function Reports() {
    const navigate = useNavigate();

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadReports = async () => {
            try {
                const response = await diseaseService.getReports();

                setReports(response.reports || []);
            } catch (error) {
                console.error("Unable to load reports:", error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load disease reports."
                );
            } finally {
                setLoading(false);
            }
        };

        loadReports();
    }, []);

    const openReport = (reportId) => {
        navigate(`/reports/${reportId}`);
    };

    return (
        <div className="reports-page">

            <div className="reports-card">

                <button
                    className="reports-back-button"
                    onClick={() => navigate("/dashboard")}
                >
                    ← Back to Dashboard
                </button>

                <div className="reports-header">
                    <h1>Disease Reports</h1>

                    <p>
                        View your previous crop health analysis reports.
                    </p>
                </div>

                {loading && (
                    <div className="reports-message">
                        Loading reports...
                    </div>
                )}

                {error && (
                    <div className="reports-error">
                        {error}
                    </div>
                )}

                {!loading && !error && reports.length === 0 && (
                    <div className="reports-empty">
                        <div className="reports-empty-icon">
                            📋
                        </div>

                        <h2>No Disease Reports Yet</h2>

                        <p>
                            Upload a crop image to generate your first
                            disease report.
                        </p>

                        <button
                            className="reports-primary-button"
                            onClick={() => navigate("/detect")}
                        >
                            Analyze Crop
                        </button>
                    </div>
                )}

                {!loading && !error && reports.length > 0 && (
                    <div className="reports-list">

                        {reports.map((report) => (
                            <div
                                className="report-card"
                                key={report._id}
                            >
                                <div className="report-card-content">

                                    <div className="report-card-image">
                                        <img
                                            src={report.image}
                                            alt="Analyzed crop"
                                        />
                                    </div>

                                    <div className="report-card-details">

                                        <h2>
                                            {report.disease}
                                        </h2>

                                        <p>
                                            <strong>Crop:</strong>{" "}
                                            {report.crop}
                                        </p>

                                        <p>
                                            <strong>Confidence:</strong>{" "}
                                            {report.confidence}%
                                        </p>

                                        <p>
                                            <strong>Risk Level:</strong>{" "}
                                            {report.riskLevel}
                                        </p>

                                        <p>
                                            <strong>Status:</strong>{" "}
                                            {report.status}
                                        </p>

                                        <p>
                                            <strong>Date:</strong>{" "}
                                            {report.createdAt
                                                ? new Date(
                                                    report.createdAt
                                                ).toLocaleString()
                                                : "--"}
                                        </p>

                                    </div>

                                    <button
                                        className="view-report-button"
                                        onClick={() =>
                                            openReport(report._id)
                                        }
                                    >
                                        View Report
                                    </button>

                                </div>
                            </div>
                        ))}

                    </div>
                )}

            </div>

        </div>
    );
}

export default Reports;