import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import diseaseService from "../services/diseaseservice";

import "./reportdetail.css";

function ReportDetail() {
    const navigate = useNavigate();
    const { reportId } = useParams();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const loadReport = async () => {
            try {
                const response = await diseaseService.getReportById(reportId);

                setReport(response.report);
            } catch (error) {
                console.error("Unable to load report:", error);

                setError(
                    error.response?.data?.message ||
                    "Unable to load disease report."
                );
            } finally {
                setLoading(false);
            }
        };

        loadReport();
    }, [reportId]);

    if (loading) {
        return (
            <div className="report-detail-page">
                <div className="report-detail-card">
                    <p className="report-detail-message">
                        Loading report...
                    </p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="report-detail-page">
                <div className="report-detail-card">

                    <button
                        className="report-detail-back-button"
                        onClick={() => navigate("/reports")}
                    >
                        ← Back to Reports
                    </button>

                    <div className="report-detail-error">
                        {error}
                    </div>

                </div>
            </div>
        );
    }

    if (!report) {
        return null;
    }

    return (
        <div className="report-detail-page">

            <div className="report-detail-card">

                <button
                    className="report-detail-back-button"
                    onClick={() => navigate("/reports")}
                >
                    ← Back to Reports
                </button>

                <div className="report-detail-header">
                    <h1>Crop Health Report</h1>

                    <p>
                        Detailed disease analysis for your crop.
                    </p>
                </div>

                <div className="report-detail-image">
                    <img
                        src={report.image}
                        alt="Analyzed crop"
                    />
                </div>

                <div className="report-detail-summary">

                    <h2>{report.disease}</h2>

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

                <div className="report-detail-block">
                    <h3>Why does it happen?</h3>
                    <p>{report.whyItHappens || "--"}</p>
                </div>

                <div className="report-detail-block">
                    <h3>Expected Spread</h3>
                    <p>{report.expectedSpread || "--"}</p>
                </div>

                <div className="report-detail-block">
                    <h3>Solution</h3>
                    <p>{report.solution || "--"}</p>
                </div>

                <div className="report-detail-block">
                    <h3>Prevention</h3>

                    {report.prevention?.length > 0 ? (
                        <ul>
                            {report.prevention.map(
                                (item, index) => (
                                    <li key={index}>
                                        {item}
                                    </li>
                                )
                            )}
                        </ul>
                    ) : (
                        <p>--</p>
                    )}
                </div>

                <div className="report-detail-block">
                    <h3>Sensor Readings</h3>

                    <p>
                        <strong>Temperature:</strong>{" "}
                        {report.sensorReadings?.temperature ?? "--"} °C
                    </p>

                    <p>
                        <strong>Humidity:</strong>{" "}
                        {report.sensorReadings?.humidity ?? "--"} %
                    </p>

                    <p>
                        <strong>Soil Moisture:</strong>{" "}
                        {report.sensorReadings?.soilMoisture ?? "--"} %
                    </p>
                </div>

                <div className="report-detail-qr">

                    <h3>📱 Report QR Code</h3>

                    {report.qrCode ? (
                        <>
                            <p>
                                Scan this QR code to open the
                                public crop health report.
                            </p>

                            <img
                                src={report.qrCode}
                                alt="Crop Health Report QR Code"
                                className="report-detail-qr-image"
                            />
                        </>
                    ) : (
                        <p>QR code is not available.</p>
                    )}

                </div>

            </div>

        </div>
    );
}

export default ReportDetail;