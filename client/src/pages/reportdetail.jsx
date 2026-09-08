import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import diseaseService from "../services/diseaseservice";
import Navbar from "../components/Navbar";
import { displayRiskLevel, isHealthyDisease } from "../utils/reportDisplay";
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
            "Unable to load this disease report.",
        );
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [reportId]);

  const formatDate = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "--";

    return new Date(date).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getRiskClass = (riskLevel) => {
    switch (riskLevel) {
      case "High":
      case "Critical":
        return "detail-risk-high";

      case "Medium":
        return "detail-risk-medium";

      default:
        return "detail-risk-low";
    }
  };

  const getRiskMessage = (riskLevel) => {
    switch (riskLevel) {
      case "Critical":
        return "Immediate attention required";

      case "High":
        return "Immediate action recommended";

      case "Medium":
        return "Monitor and take preventive action";

      default:
        return "Continue regular monitoring";
    }
  };

  if (loading) {
    return (
      <div className="report-detail-page">
        <Navbar />

        <main className="report-detail-container">
          <div className="report-detail-state">
            <div className="report-state-icon">◌</div>
            <h2>Loading Report</h2>
            <p>Please wait while we load the crop health report.</p>
          </div>
        </main>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="report-detail-page">
        <Navbar />

        <main className="report-detail-container">
          <div className="report-detail-state report-detail-error">
            <div className="report-state-icon">!</div>

            <h2>Report Not Available</h2>

            <p>{error || "The requested report could not be found."}</p>

            <button
              className="return-reports-button"
              onClick={() => navigate("/reports")}
            >
              Back to Reports
            </button>
          </div>
        </main>
      </div>
    );
  }

  const sensor = report.sensorReadings || {};
  const riskLevel = displayRiskLevel(report);
  const healthyCrop = isHealthyDisease(report.disease);

  return (
    <div className="report-detail-page">
      <Navbar />

      <main className="report-detail-container">
        {/* =====================================================
                    Back
                ====================================================== */}

        <button
          className="report-detail-back"
          onClick={() => navigate("/reports")}
        >
          ← Back to Reports
        </button>

        {/* =====================================================
                    Report Header
                ====================================================== */}

        <section className="report-detail-header">
          <div>
            <p className="report-detail-eyebrow">CROP HEALTH ANALYSIS</p>

            <h1>Crop Health Report</h1>

            <p>
              AI-powered disease detection and environmental analysis for your
              crop.
            </p>
          </div>

          <div className="report-generated">
            <span>Generated on</span>
            <strong>
              {formatDate(report.createdAt)}, {formatTime(report.createdAt)}
            </strong>
          </div>
        </section>

        {/* =====================================================
                    Main Summary
                ====================================================== */}

        <section className="report-summary-grid">
          <div className="analysis-image-card">
            <img
              src={`${import.meta.env.VITE_API_URL.replace(/\/api$/, "")}/${report.image.replace(/\\/g, "/").replace(/^https?:\/\/[^/]+\/+/, "")}`}
              alt="Analyzed crop"
            />

            <span className="analysis-image-label">Analysis Image</span>
          </div>

          <div className="disease-summary-card">
            <div className="summary-icon">🌿</div>

            <div className="summary-content">
              <span>Detected Disease</span>

              <h2>{report.disease || "Unknown Disease"}</h2>

              <p>
                <strong>Crop:</strong> {report.crop || "--"}
              </p>

              <p>
                <strong>Farm:</strong>{" "}
                {report.farmId?.farmName || report.farmName || "--"}
              </p>
            </div>
          </div>

          <div className="summary-side">
            <div
              className={`risk-summary-card ${getRiskClass(riskLevel)}`}
            >
              <span>Risk Level</span>

              <strong>{riskLevel} Risk</strong>

              <small>{getRiskMessage(riskLevel)}</small>
            </div>

            <div className="confidence-summary-card">
              <div className="confidence-heading">
                <span>Confidence</span>

                <strong>
                  {report.confidence != null
                    ? Number(report.confidence).toFixed(2)
                    : "--"}
                  %
                </strong>
              </div>

              <div className="confidence-bar">
                <div
                  style={{
                    width: `${Math.min(Number(report.confidence) || 0, 100)}%`,
                  }}
                ></div>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
                    Sensor + Analysis Details
                ====================================================== */}

        <section className="report-information-grid">
          <div className="sensor-panel">
            <div className="panel-heading">
              <span className="panel-heading-icon">🌿</span>

              <div>
                <h2>Sensor Readings</h2>
                <p>At time of analysis</p>
              </div>
            </div>

            <div className="sensor-card-grid">
              <div className="detail-sensor-card">
                <span className="sensor-card-icon">🌡</span>

                <div>
                  <span>Temperature</span>

                  <strong>{sensor.temperature ?? "--"} °C</strong>
                </div>
              </div>

              <div className="detail-sensor-card">
                <span className="sensor-card-icon">💧</span>

                <div>
                  <span>Humidity</span>

                  <strong>{sensor.humidity ?? "--"} %</strong>
                </div>
              </div>

              <div className="detail-sensor-card">
                <span className="sensor-card-icon">🌱</span>

                <div>
                  <span>Soil Moisture</span>

                  <strong>{sensor.soilMoisture ?? "--"} %</strong>
                </div>
              </div>
            </div>

            {report.sensorFactors?.length > 0 && (
              <div style={{ marginTop: "16px", padding: "12px 16px", background: "#fffbeb", borderRadius: "10px", border: "1px solid #fde68a" }}>
                <strong style={{ color: "#b45309", display: "block", marginBottom: "6px", fontSize: "14px" }}>
                  ⚠️ Environmental Warnings:
                </strong>
                <ul style={{ margin: "0", paddingLeft: "18px", color: "#92400e", fontSize: "13px", lineHeight: "1.5" }}>
                  {report.sensorFactors.map((factor, index) => (
                    <li key={index}>{factor}</li>
                  ))}
                </ul>
                {report.riskConditions && (
                  <p style={{ margin: "6px 0 0", color: "#b45309", fontStyle: "italic", fontSize: "12px" }}>
                    {report.riskConditions}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="analysis-details-panel">
            <div className="panel-heading">
              <span className="panel-heading-icon">◈</span>

              <div>
                <h2>Analysis Details</h2>
              </div>
            </div>

            <div className="analysis-detail-list">
              <div>
                <span>▣</span>

                <p>
                  <small>Date</small>
                  <strong>{formatDate(report.createdAt)}</strong>
                </p>
              </div>

              <div>
                <span>◷</span>

                <p>
                  <small>Time</small>
                  <strong>{formatTime(report.createdAt)}</strong>
                </p>
              </div>

              <div>
                <span>⌖</span>

                <p>
                  <small>Location</small>
                  <strong>
                    {report.location || report.farmId?.location || "--"}
                  </strong>
                </p>
              </div>

              <div>
                <span>🌿</span>

                <p>
                  <small>Crop Stage</small>
                  <strong>
                    {report.cropStage || report.farmId?.cropStage || "--"}
                  </strong>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
                    Disease Explanation
                ====================================================== */}

        <section className="report-content-grid two-column">
          <article className="report-content-card about-disease">
            <div className="content-card-heading">
              <span>●</span>

              <h2>About the Disease</h2>
            </div>

            <p>
              {report.whyItHappens ||
                "Disease information is not available for this report."}
            </p>
          </article>

          <article className="report-content-card why-disease">
            <div className="content-card-heading">
              <span>⚙</span>

              <h2>Why Does It Happen?</h2>
            </div>

            <p>
              {report.whyItHappens ||
                "The disease may be influenced by environmental conditions and crop factors."}
            </p>
          </article>
        </section>

        {/* =====================================================
                    Spread / Solution / Prevention
                ====================================================== */}

        <section className="report-content-grid three-column">
          <article className="report-content-card spread-card">
            <div className="content-card-heading">
              <span>▥</span>

              <h2>Expected Spread</h2>
            </div>

            <p>
              {report.expectedSpread ||
                "Spread information is not available for this report."}
            </p>
          </article>

          <article className="report-content-card solution-card">
            <div className="content-card-heading">
              <span>✓</span>

              <h2>Recommended Solution</h2>
            </div>

            <p>
              {report.solution ||
                "Follow appropriate crop management practices and monitor the affected area regularly."}
            </p>
          </article>

          <article className="report-content-card prevention-card">
            <div className="content-card-heading">
              <span>🌿</span>

              <h2>Prevention Tips</h2>
            </div>

            {report.prevention?.length > 0 ? (
              <ul>
                {report.prevention.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>
                Continue regular monitoring and maintain good crop management
                practices.
              </p>
            )}
          </article>
        </section>

        {/* =====================================================
                    Recommendation + QR
                ====================================================== */}

        <section className="bottom-report-grid">
          <div className="recommendation-card">
            <div className="recommendation-icon">🌱</div>

            <div>
              <h2>Our Recommendation</h2>

              <p>
                {healthyCrop
                  ? "The crop appears healthy. Continue regular monitoring and maintain current field practices."
                  : "Take timely action to manage the detected crop condition and prevent further spread."}
              </p>

              <p>
                Regular monitoring and proper field management can help protect
                your crop and support better yield.
              </p>

              <div className="recommendation-quote">
                Healthy Plants, Prosperous Farmers
              </div>
            </div>
          </div>

          <div className="qr-report-card">
            <div className="qr-report-content">
              <div className="qr-heading">
                <span>▣</span>

                <div>
                  <h2>Scan QR for Full Report</h2>

                  <p>Scan this QR code to view this report online.</p>
                </div>
              </div>

              {report.qrCode ? (
                <img
                  src={report.qrCode}
                  alt="Crop health report QR code"
                  className="detail-qr-code"
                />
              ) : (
                <div className="qr-unavailable">QR unavailable</div>
              )}
            </div>

            <p className="report-id">Report ID: {report._id}</p>
          </div>
        </section>

        {/* =====================================================
                    Actions
                ====================================================== */}

        <div className="report-actions">
          <button
            className="secondary-report-button"
            onClick={() => navigate("/reports")}
          >
            Back to Reports
          </button>

          <button
            className="primary-report-button"
            onClick={() => navigate("/detect")}
          >
            Analyze Another Crop
          </button>
        </div>
      </main>
    </div>
  );
}

export default ReportDetail;
