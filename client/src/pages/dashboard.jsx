import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import farmService from "../services/farmservice";
import sensorService from "../services/sensorservice";
import diseaseService from "../services/diseaseservice";
import Navbar from "../components/Navbar";
import "./dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [farm, setFarm] = useState(null);
  const [device, setDevice] = useState(null);
  const [sensorReading, setSensorReading] = useState(null);
  const [reports, setReports] = useState([]);

  const [loading, setLoading] = useState(true);
  const [sensorLoading, setSensorLoading] = useState(true);
  const [reportsLoading, setReportsLoading] = useState(true);

  const [isSensorOnline, setIsSensorOnline] = useState(false);

  useEffect(() => {
    let sensorInterval = null;
    let mounted = true;

    // =====================================================
    // CHECK WHETHER LATEST READING IS FRESH
    // =====================================================
    const ONLINE_MS = 45 * 1000;

    const isFreshTimestamp = (value) => {
      if (!value) {
        return false;
      }

      const timestamp = new Date(value).getTime();

      if (Number.isNaN(timestamp)) {
        return false;
      }

      return Date.now() - timestamp < ONLINE_MS;
    };

    const loadSensorData = async (assignedDevice) => {
      const assignedDeviceId = assignedDevice?.deviceId;

      if (!assignedDeviceId) {
        if (mounted) {
          setSensorReading(null);
          setIsSensorOnline(false);
        }
        return;
      }

      try {
        const sensorResponse =
          await sensorService.getLatestReading(
            assignedDeviceId
          );

        if (!mounted) {
          return;
        }

        const reading = sensorResponse?.reading;

        if (reading) {
          setSensorReading(reading);
        }

        setIsSensorOnline(
          isFreshTimestamp(reading?.recordedAt) ||
          isFreshTimestamp(reading?.updatedAt) ||
          isFreshTimestamp(reading?.createdAt)
        );
      } catch (error) {
        console.error(
          "Unable to load sensor data:",
          error
        );

        if (mounted) {
          setIsSensorOnline(false);
        }
      }
    };

    // =====================================================
    // LOAD DASHBOARD
    // =====================================================
    const loadDashboardData = async () => {
      try {
        // =================================================
        // LOAD FARM
        // =================================================
        const farmResponse =
          await farmService.getMyFarms();

        if (!mounted) {
          return;
        }

        const farms = farmResponse?.farms || [];

        if (farms.length > 0) {
          setFarm(farms[0]);
        } else {
          setFarm(null);
        }

        // =================================================
        // GET DEVICE FOR LOGGED-IN FARMER
        // =================================================
        try {
          const deviceResponse =
            await sensorService.getMyDevice();

          if (!mounted) {
            return;
          }

          const assignedDevice =
            deviceResponse?.device || null;

          setDevice(assignedDevice);

          // No device assigned
          if (!assignedDevice?.deviceId) {
            setSensorReading(null);
            setIsSensorOnline(false);
          } else {
            // Load initial reading
            setIsSensorOnline(
              isFreshTimestamp(assignedDevice.lastSeen)
            );

            await loadSensorData(assignedDevice);

            sensorInterval = setInterval(() => {
              loadSensorData(assignedDevice);
            }, 5000);
          }
        } catch (deviceError) {
          console.error(
            "Unable to load assigned device:",
            deviceError
          );

          if (mounted) {
            setDevice(null);
            setSensorReading(null);
            setIsSensorOnline(false);
          }
        }

        // =================================================
        // LOAD DISEASE REPORTS
        // =================================================
        try {
          const reportResponse =
            await diseaseService.getReports();

          if (!mounted) {
            return;
          }

          const latestReports = (
            reportResponse?.reports || []
          )
            .sort(
              (a, b) =>
                new Date(b.createdAt || 0) -
                new Date(a.createdAt || 0)
            )
            .slice(0, 1);

          setReports(latestReports);
        } catch (reportError) {
          console.error(
            "Unable to load disease reports:",
            reportError
          );

          if (mounted) {
            setReports([]);
          }
        }
      } catch (error) {
        console.error(
          "Unable to load dashboard data:",
          error
        );

        if (mounted) {
          setFarm(null);
          setDevice(null);
          setSensorReading(null);
          setIsSensorOnline(false);
        }
      } finally {
        if (mounted) {
          setLoading(false);
          setSensorLoading(false);
          setReportsLoading(false);
        }
      }
    };

    loadDashboardData();

    return () => {
      mounted = false;

      if (sensorInterval) {
        clearInterval(sensorInterval);
      }
    };
  }, []);

  // =====================================================
  // RISK CLASS
  // =====================================================
  const getRiskClass = (riskLevel) => {
    switch (riskLevel) {
      case "High":
      case "Critical":
        return "dashboard-risk-high";

      case "Medium":
        return "dashboard-risk-medium";

      default:
        return "dashboard-risk-low";
    }
  };

  // =====================================================
  // RISK ICON
  // =====================================================
  const getRiskIcon = (riskLevel) => {
    switch (riskLevel) {
      case "High":
      case "Critical":
        return "⚠";

      case "Medium":
        return "△";

      default:
        return "✓";
    }
  };

  // =====================================================
  // FORMAT DATE
  // =====================================================
  const formatDate = (date) => {
    if (!date) {
      return "--";
    }

    return new Date(date).toLocaleDateString(
      "en-GB",
      {
        day: "2-digit",
        month: "short",
        year: "numeric"
      }
    );
  };

  // =====================================================
  // FORMAT TIME
  // =====================================================
  const formatTime = (date) => {
    if (!date) {
      return "--";
    }

    return new Date(date).toLocaleTimeString(
      "en-US",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    );
  };

  const latestReport = reports[0];

  return (
    <div className="dashboard">
      <Navbar />

      <main className="dashboard-container">

        {/* =====================================================
                            HERO
        ====================================================== */}

        <section className="dashboard-hero">

          <div className="hero-content">

            <p className="hero-welcome">
              Welcome back, Farmer! 👋
            </p>

            <h1>
              Monitor your crop health
            </h1>

            <p className="hero-description">
              Detect crop diseases early and keep your farm healthy.
            </p>

          </div>

          <div className="hero-farm-illustration">

            <div className="sun"></div>

            <div className="cloud cloud-one"></div>
            <div className="cloud cloud-two"></div>

            <div className="hill hill-one"></div>
            <div className="hill hill-two"></div>

            <div className="field field-one"></div>
            <div className="field field-two"></div>
            <div className="field field-three"></div>

            <div className="farm-house">

              <div className="house-roof"></div>

              <div className="house-body">
                <div className="house-window"></div>
                <div className="house-door"></div>
              </div>

            </div>

            <div className="windmill">

              <div className="windmill-pole"></div>
              <div className="windmill-center"></div>

              <div className="windmill-blade blade-one"></div>
              <div className="windmill-blade blade-two"></div>
              <div className="windmill-blade blade-three"></div>
              <div className="windmill-blade blade-four"></div>

            </div>

            <div className="tree tree-one">
              <span></span>
              <i></i>
            </div>

            <div className="tree tree-two">
              <span></span>
              <i></i>
            </div>

          </div>

          <div className="hero-action">

            <button
              onClick={() => navigate("/detect")}
            >
              <span className="hero-action-icon">
                ✣
              </span>

              Detect Disease
            </button>

            <p>
              Upload crop image and
              <br />
              get AI analysis in seconds
            </p>

          </div>

        </section>

        {/* =====================================================
                          STAT CARDS
        ====================================================== */}

        <section className="dashboard-stats">

          {/* My Crop */}
          <div className="dashboard-stat-card">

            <div className="stat-circle crop-circle">
              🌾
            </div>

            <div className="stat-content">

              <span>
                My Crop
              </span>

              <strong>
                {farm?.crop || "Not Added"}
              </strong>

              <small className="healthy-label">
                Healthy Growth
              </small>

            </div>

          </div>

          {/* Last Diagnosis */}
          <div className="dashboard-stat-card">

            <div className="stat-circle diagnosis-circle">
              🩺
            </div>

            <div className="stat-content">

              <span>
                Last Diagnosis
              </span>

              <strong className="diagnosis-text">
                {latestReport?.disease || "No Report"}
              </strong>

              <small
                className={`risk-label ${
                  latestReport
                    ? getRiskClass(
                        latestReport.riskLevel
                      )
                    : "dashboard-risk-low"
                }`}
              >
                {latestReport
                  ? `${latestReport.riskLevel} Risk`
                  : "No Analysis"}
              </small>

            </div>

          </div>

          {/* Temperature */}
          <div className="dashboard-stat-card">

            <div className="stat-circle temperature-circle">
              🌡️
            </div>

            <div className="stat-content">

              <span>
                Temperature
              </span>

              <strong className="temperature-text">
                {sensorReading
                  ? `${sensorReading.temperature} °C`
                  : "-- °C"}
              </strong>

              <small className="normal-label">
                Normal
              </small>

            </div>

          </div>

          {/* Humidity */}
          <div className="dashboard-stat-card">

            <div className="stat-circle humidity-circle">
              💧
            </div>

            <div className="stat-content">

              <span>
                Humidity
              </span>

              <strong className="humidity-text">
                {sensorReading
                  ? `${sensorReading.humidity} %`
                  : "-- %"}
              </strong>

              <small className="normal-label">
                Normal
              </small>

            </div>

          </div>

        </section>

        {/* =====================================================
                         FARM + SENSOR
        ====================================================== */}

        <section className="dashboard-middle">

          {/* =================================================
                              FARM
          ================================================== */}

          <div className="dashboard-large-card farm-card">

            <div className="large-card-header">

              <div className="large-title">

                <span className="large-title-icon">
                  ♧
                </span>

                <h2>
                  My Farm
                </h2>

              </div>

              <button
                className="edit-farm-button"
                onClick={() =>
                  navigate(
                    farm
                      ? `/farm/${farm._id}`
                      : "/farm"
                  )
                }
              >
                ✎ Edit Farm
              </button>

            </div>

            {loading ? (

              <div className="dashboard-loading">
                Loading farm...
              </div>

            ) : farm ? (

              <div className="farm-card-body">

                <div className="farm-photo">

                  <div className="farm-photo-sky"></div>
                  <div className="farm-photo-hill"></div>
                  <div className="farm-photo-field"></div>

                  <div className="farm-photo-house">
                    <div></div>
                    <span></span>
                  </div>

                  <div className="farm-photo-tree tree-a"></div>
                  <div className="farm-photo-tree tree-b"></div>

                </div>

                <div className="farm-detail-list">

                  <div className="farm-detail-row">
                    <span>⌂</span>

                    <label>
                      Farm Name
                    </label>

                    <strong>
                      {farm.farmName}
                    </strong>
                  </div>

                  <div className="farm-detail-row">
                    <span>⌖</span>

                    <label>
                      Location
                    </label>

                    <strong>
                      {farm.location}
                    </strong>
                  </div>

                  <div className="farm-detail-row">
                    <span>◇</span>

                    <label>
                      Crop
                    </label>

                    <strong>
                      {farm.crop}
                      {farm.cropVariety
                        ? ` (${farm.cropVariety})`
                        : ""}
                    </strong>
                  </div>

                  <div className="farm-detail-row">
                    <span>♧</span>

                    <label>
                      Crop Stage
                    </label>

                    <strong>
                      {farm.cropStage || "--"}
                    </strong>
                  </div>

                  <div className="farm-detail-row">
                    <span>▷</span>

                    <label>
                      Soil Type
                    </label>

                    <strong>
                      {farm.soilType || "--"}
                    </strong>
                  </div>

                </div>

              </div>

            ) : (

              <div className="farm-empty">

                <div>
                  🌱
                </div>

                <h3>
                  No Farm Added
                </h3>

                <p>
                  Add your farm information to start monitoring.
                </p>

                <button
                  onClick={() => navigate("/farm")}
                >
                  + Add Farm
                </button>

              </div>

            )}

          </div>

          {/* =================================================
                             SENSOR
          ================================================== */}

          <div className="dashboard-large-card sensor-card">

            <div className="large-card-header">

              <div className="large-title">

                <span className="large-title-icon">
                  ◉
                </span>

                <h2>
                  Sensor Status
                </h2>

              </div>

              <span
                className={`sensor-status ${
                  isSensorOnline
                    ? "sensor-online"
                    : "sensor-offline"
                }`}
              >

                <i></i>

                {isSensorOnline
                  ? "Online"
                  : "Offline"}

              </span>

            </div>

            {sensorLoading ? (

              <div className="dashboard-loading">
                Loading sensor data...
              </div>

            ) : (

              <div className="sensor-content">

                <div className="sensor-cards">

                  {/* Temperature */}
                  <div className="sensor-widget">

                    <div className="sensor-widget-top">

                      <span className="sensor-widget-icon purple">
                        ✨
                      </span>

                      <div>

                        <strong>
                          {sensorReading
                            ? `${sensorReading.temperature} °C`
                            : "-- °C"}
                        </strong>

                        <span>
                          Temperature
                        </span>

                      </div>

                    </div>

                    <div className="mini-chart purple-chart">

                      <svg
                        viewBox="0 0 240 55"
                        preserveAspectRatio="none"
                      >

                        <path
                          d="M0 38 C15 25, 25 45, 40 34 S65 24, 80 36 S105 40, 120 26 S145 22, 160 31 S185 45, 200 27 S220 22, 240 34"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        />

                      </svg>

                    </div>

                  </div>

                  {/* Humidity */}
                  <div className="sensor-widget">

                    <div className="sensor-widget-top">

                      <span className="sensor-widget-icon blue">
                        💧
                      </span>

                      <div>

                        <strong>
                          {sensorReading
                            ? `${sensorReading.humidity} %`
                            : "-- %"}
                        </strong>

                        <span>
                          Humidity
                        </span>

                      </div>

                    </div>

                    <div className="mini-chart blue-chart">

                      <svg
                        viewBox="0 0 240 55"
                        preserveAspectRatio="none"
                      >

                        <path
                          d="M0 39 C20 45, 27 49, 42 32 S65 22, 78 37 S104 44, 120 27 S145 19, 160 31 S182 37, 200 25 S225 34, 240 20"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        />

                      </svg>

                    </div>

                  </div>

                  {/* Soil Moisture */}
                  <div className="sensor-widget">

                    <div className="sensor-widget-top">

                      <span className="sensor-widget-icon green">
                        ♧
                      </span>

                      <div>

                        <strong>
                          {sensorReading
                            ? `${sensorReading.soilMoisture} %`
                            : "-- %"}
                        </strong>

                        <span>
                          Soil Moisture
                        </span>

                      </div>

                    </div>

                    <div className="mini-chart green-chart">

                      <svg
                        viewBox="0 0 240 55"
                        preserveAspectRatio="none"
                      >

                        <path
                          d="M0 40 C20 33, 30 27, 45 29 S70 18, 90 22 S110 25, 130 20 S155 23, 175 30 S195 18, 210 22 S225 25, 240 18"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        />

                      </svg>

                    </div>

                  </div>

                </div>

                {/* Sensor Footer */}
                <div className="sensor-footer">

                  <div>

                    <span>
                      ▣
                    </span>

                    Device ID:{" "}

                    {device?.deviceId || "--"}

                  </div>

                  <div className="sensor-divider"></div>

                  <div>

                    <span>
                      ◷
                    </span>

                    Last Updated:{" "}

                    {sensorReading?.recordedAt
                      ? formatTime(
                          sensorReading.recordedAt
                        )
                      : "--"}

                  </div>

                </div>

              </div>

            )}

          </div>

        </section>

        {/* =====================================================
                    RECENT DISEASE REPORT
        ====================================================== */}

        <section className="dashboard-report-card">

          <div className="report-card-header">

            <div className="large-title">

              <span className="large-title-icon">
                ♧
              </span>

              <h2>
                Recent Disease Reports
              </h2>

            </div>

            <button
              className="view-all-reports"
              onClick={() => navigate("/reports")}
            >
              View All Reports →
            </button>

          </div>

          {reportsLoading ? (

            <div className="dashboard-loading">
              Loading recent report...
            </div>

          ) : latestReport ? (

            <div className="dashboard-report-content">

              <div className="report-image-area">

                <div className="report-image-ring">

                  <img
                    src={`${import.meta.env.VITE_API_URL.replace(
                      /\/api$/,
                      ""
                    )}/${latestReport.image
                      .replace(/\\/g, "/")
                      .replace(
                        /^https?:\/\/[^/]+\/+/,
                        ""
                      )}`}
                    alt={
                      latestReport.disease ||
                      "Crop disease"
                    }
                  />

                </div>

                <div className="report-image-icon">
                  🩺
                </div>

              </div>

              <div className="report-main-content">

                <div className="report-title-row">

                  <h3>
                    {latestReport.disease ||
                      "Unknown Disease"}
                  </h3>

                  <span
                    className={`dashboard-risk-badge ${getRiskClass(
                      latestReport.riskLevel
                    )}`}
                  >

                    <span>
                      {getRiskIcon(
                        latestReport.riskLevel
                      )}
                    </span>

                    {latestReport.riskLevel ||
                      "Low"}{" "}
                    Risk

                  </span>

                </div>

                <div className="report-meta-row">

                  {/* Crop */}
                  <div className="report-meta-item">

                    <span className="report-meta-icon green">
                      ♧
                    </span>

                    <div>

                      <small>
                        Crop
                      </small>

                      <strong>
                        {latestReport.crop ||
                          "--"}
                      </strong>

                    </div>

                  </div>

                  <div className="meta-separator"></div>

                  {/* Confidence */}
                  <div className="report-meta-item">

                    <span className="report-meta-icon green">
                      ✢
                    </span>

                    <div>

                      <small>
                        Confidence
                      </small>

                      <strong>
                        {latestReport.confidence != null
                          ? Number(
                              latestReport.confidence
                            ).toFixed(2)
                          : "--"}
                        %
                      </strong>

                    </div>

                  </div>

                  <div className="meta-separator"></div>

                  {/* Detected On */}
                  <div className="report-meta-item">

                    <span className="report-meta-icon orange">
                      ▣
                    </span>

                    <div>

                      <small>
                        Detected On
                      </small>

                      <strong>
                        {formatDate(
                          latestReport.createdAt
                        )}
                        ,{" "}
                        {formatTime(
                          latestReport.createdAt
                        )}
                      </strong>

                    </div>

                  </div>

                </div>

                <div className="quick-suggestion">

                  <span>
                    ♧
                  </span>

                  <strong>
                    Quick Suggestion:
                  </strong>

                  <p>
                    {latestReport.solution ||
                      "Continue monitoring the crop and take appropriate preventive action to reduce disease spread."}
                  </p>

                </div>

              </div>

              <button
                className="report-view-button"
                onClick={() =>
                  navigate(
                    `/reports/${latestReport._id}`
                  )
                }
              >

                <span>
                  ◉
                </span>

                View Report

                <strong>
                  ›
                </strong>

              </button>

            </div>

          ) : (

            <div className="dashboard-report-empty">

              <div>
                📋
              </div>

              <h3>
                No Disease Reports Yet
              </h3>

              <p>
                Analyze a crop image to generate your first report.
              </p>

              <button
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