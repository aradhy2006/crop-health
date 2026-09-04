import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authservice";
import farmService from "../services/farmservice";
import sensorService from "../services/sensorservice";
import diseaseService from "../services/diseaseservice";
import "./dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [farm, setFarm] = useState(null);
  const [sensorReading, setSensorReading] = useState(null);
  const [latestReport, setLatestReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sensorLoading, setSensorLoading] = useState(true);

  const deviceId = "ESP32-003";

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const farmResponse = await farmService.getMyFarms();

        if (farmResponse.farms.length > 0) {
          setFarm(farmResponse.farms[0]);
        }

        const reportResponse = await diseaseService.getReports();

        if (reportResponse.reports?.length > 0) {
          setLatestReport(reportResponse.reports[0]);
        }

        try {
          const sensorResponse = await sensorService.getLatestReading(deviceId);

          setSensorReading(sensorResponse.reading);
        } catch (sensorError) {
          console.error("Unable to load sensor data:", sensorError);
        }
      } catch (error) {
        console.error("Unable to load dashboard data:", error);
      } finally {
        setLoading(false);
        setSensorLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="logo">🌱 Crop Health Manager</div>

        <div className="nav-right">
          <span className="farmer-name">Farmer</span>

          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <main className="dashboard-container">
        <section className="welcome-section">
          <div>
            <p className="welcome-small">Welcome back 👋</p>

            <h1>Monitor your crop health</h1>

            <p className="welcome-text">
              Detect crop diseases early and keep your farm healthy.
            </p>
          </div>

          <button className="detect-btn" onClick={() => navigate("/detect")}>
            🔍 Detect Disease
          </button>
        </section>

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🌾</div>

            <div>
              <p>My Crop</p>

              <h2>{farm ? farm.crop : "Not Added"}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🩺</div>

            <div>
              <p>Last Diagnosis</p>

              <h2>{latestReport ? latestReport.disease : "No Report"}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🌡️</div>

            <div>
              <p>Temperature</p>

              <h2>
                {sensorLoading
                  ? "-- °C"
                  : sensorReading
                    ? `${sensorReading.temperature} °C`
                    : "-- °C"}
              </h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">💧</div>

            <div>
              <p>Humidity</p>

              <h2>
                {sensorLoading
                  ? "-- %"
                  : sensorReading
                    ? `${sensorReading.humidity} %`
                    : "-- %"}
              </h2>
            </div>
          </div>
        </section>

        <section className="dashboard-grid">
          <div className="dashboard-panel">
            <div className="panel-header">
              <h2>My Farm</h2>

              <button
                onClick={() => navigate(`/farm/${farm._id}`)}
                className="text-btn"
              >
                Edit
              </button>
            </div>

            {loading ? (
              <div className="empty-state">
                <p>Loading farm...</p>
              </div>
            ) : farm ? (
              <div className="farm-details">
                <h3>{farm.farmName}</h3>

                <div className="farm-info">
                  <p>
                    <strong>Location:</strong> {farm.location}
                  </p>

                  <p>
                    <strong>Crop:</strong> {farm.crop}
                  </p>

                  <p>
                    <strong>Variety:</strong>{" "}
                    {farm.cropVariety || "Not specified"}
                  </p>

                  <p>
                    <strong>Crop Stage:</strong> {farm.cropStage}
                  </p>

                  <p>
                    <strong>Soil:</strong> {farm.soilType || "Not specified"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🌱</div>

                <h3>No farm added yet</h3>

                <p>
                  Add your farm and crop information to start monitoring your
                  crops.
                </p>

                <button
                  className="primary-btn"
                  onClick={() => navigate("/farm")}
                >
                  + Add Farm
                </button>
              </div>
            )}
          </div>

          <div className="dashboard-panel">
            <div className="panel-header">
              <h2>Sensor Status</h2>

              <span
                className={`status ${sensorReading ? "online" : "offline"}`}
              >
                {sensorReading ? "Online" : "Offline"}
              </span>
            </div>

            {sensorLoading ? (
              <div className="sensor-empty">
                <div className="sensor-icon">📡</div>

                <h3>Loading sensor data...</h3>
              </div>
            ) : sensorReading ? (
              <div className="sensor-data">
                <div className="sensor-value">
                  <span>🌡️ Temperature</span>
                  <strong>{sensorReading.temperature} °C</strong>
                </div>

                <div className="sensor-value">
                  <span>💧 Humidity</span>
                  <strong>{sensorReading.humidity} %</strong>
                </div>

                <div className="sensor-value">
                  <span>🌱 Soil Moisture</span>
                  <strong>{sensorReading.soilMoisture} %</strong>
                </div>

                <p className="device-info">Device: {deviceId}</p>
              </div>
            ) : (
              <div className="sensor-empty">
                <div className="sensor-icon">📡</div>

                <h3>Device not connected</h3>

                <p>
                  Your ESP32 sensor data will appear here when the device is
                  connected.
                </p>
              </div>
            )}
          </div>
        </section>

        <section className="dashboard-panel reports-panel">
          <div className="panel-header">
            <h2>Recent Disease Reports</h2>

            <button className="text-btn" onClick={() => navigate("/reports")}>
              View All
            </button>
          </div>

          {latestReport ? (
            <div className="report-summary">
              <div className="report-icon">🩺</div>

              <div>
                <h3>{latestReport.disease}</h3>

                <p>
                  <strong>Crop:</strong> {latestReport.crop}
                </p>

                <p>
                  <strong>Confidence:</strong> {latestReport.confidence}%
                </p>

                <p>
                  <strong>Risk:</strong> {latestReport.riskLevel}
                </p>
              </div>

              <button
                className="primary-btn"
                onClick={() => navigate(`/reports/${latestReport._id}`)}
              >
                View Report
              </button>
            </div>
          ) : (
            <div className="report-empty">
              <div className="report-icon">📋</div>

              <h3>No reports yet</h3>

              <p>Upload a crop image to generate your first disease report.</p>

              <button
                className="primary-btn"
                onClick={() => navigate("/detect")}
              >
                Analyze Crop
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default Dashboard;
