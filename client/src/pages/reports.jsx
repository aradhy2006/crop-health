import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import diseaseService from "../services/diseaseservice";
import Navbar from "../components/Navbar";
import "./reports.css";

function Reports() {
    const navigate = useNavigate();

    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [cropFilter, setCropFilter] = useState("All Crops");
    const [riskFilter, setRiskFilter] = useState("All Risk Levels");
    const [sortOrder, setSortOrder] = useState("newest");

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

    const cropOptions = useMemo(() => {
        const crops = reports
            .map((report) => report.crop)
            .filter(Boolean);

        return ["All Crops", ...new Set(crops)];
    }, [reports]);

    const filteredReports = useMemo(() => {
        const searchText = search.trim().toLowerCase();

        const filtered = reports.filter((report) => {
            const matchesSearch =
                !searchText ||
                report.crop?.toLowerCase().includes(searchText) ||
                report.disease?.toLowerCase().includes(searchText) ||
                report.location?.toLowerCase().includes(searchText);

            const matchesCrop =
                cropFilter === "All Crops" ||
                report.crop === cropFilter;

            const matchesRisk =
                riskFilter === "All Risk Levels" ||
                report.riskLevel === riskFilter;

            return matchesSearch && matchesCrop && matchesRisk;
        });

        return [...filtered].sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();

            return sortOrder === "newest"
                ? dateB - dateA
                : dateA - dateB;
        });
    }, [reports, search, cropFilter, riskFilter, sortOrder]);

    const totalReports = reports.length;

    const highRiskReports = reports.filter(
        (report) =>
            report.riskLevel === "High" ||
            report.riskLevel === "Critical"
    ).length;

    const healthyReports = reports.filter((report) => {
        const disease = report.disease?.toLowerCase() || "";

        return (
            disease.includes("healthy") ||
            disease.includes("no disease") ||
            disease === "healthy plant"
        );
    }).length;

    const getRiskClass = (riskLevel) => {
        switch (riskLevel) {
            case "High":
            case "Critical":
                return "risk-high";

            case "Medium":
                return "risk-medium";

            case "Low":
                return "risk-low";

            default:
                return "risk-low";
        }
    };

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

    const formatDate = (date) => {
        if (!date) {
            return "--";
        }

        return new Date(date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
        });
    };

    const formatTime = (date) => {
        if (!date) {
            return "--";
        }

        return new Date(date).toLocaleTimeString("en-US", {
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    const openReport = (reportId) => {
        navigate(`/reports/${reportId}`);
    };

    return (
        <div className="reports-page">
            <Navbar />

            <main className="reports-container">
                {/* =====================================================
                    Hero
                ====================================================== */}

                <section className="reports-hero">
                    <div className="reports-hero-content">
                        <p className="reports-eyebrow">
                            YOUR CROP HEALTH HISTORY
                        </p>

                        <h1>Disease Detection Reports</h1>

                        <p className="reports-hero-description">
                            View and manage all your crop disease detection
                            results. Track health trends and take timely
                            action for better yield.
                        </p>
                    </div>

                    <div className="reports-hero-visual">
                        <div className="report-document-icon">
                            <span>▤</span>
                            <div className="document-lines">
                                <i></i>
                                <i></i>
                                <i></i>
                            </div>
                        </div>

                        <div className="report-leaf report-leaf-one">
                            ◇
                        </div>

                        <div className="report-leaf report-leaf-two">
                            ◇
                        </div>

                        <div className="report-magnifier">
                            🌿
                        </div>
                    </div>

                    <div className="reports-stat-box">
                        <div className="report-stat">
                            <span className="stat-label">
                                Total Reports
                            </span>

                            <strong>{totalReports}</strong>
                        </div>

                        <div className="report-stat">
                            <span className="stat-label">
                                High Risk
                            </span>

                            <strong className="high-stat">
                                {highRiskReports}
                            </strong>
                        </div>

                        <div className="report-stat">
                            <span className="stat-label">
                                Healthy
                            </span>

                            <strong className="healthy-stat">
                                {healthyReports}
                            </strong>
                        </div>
                    </div>
                </section>

                {/* =====================================================
                    Filters
                ====================================================== */}

                <section className="reports-toolbar">
                    <div className="search-box">
                        <span className="search-icon">⌕</span>

                        <input
                            type="text"
                            placeholder="Search by crop, disease or location..."
                            value={search}
                            onChange={(event) =>
                                setSearch(event.target.value)
                            }
                        />
                    </div>

                    <div className="filter-control">
                        <span>🌿</span>

                        <select
                            value={cropFilter}
                            onChange={(event) =>
                                setCropFilter(event.target.value)
                            }
                        >
                            {cropOptions.map((crop) => (
                                <option key={crop} value={crop}>
                                    {crop}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="filter-control">
                        <span>▥</span>

                        <select
                            value={riskFilter}
                            onChange={(event) =>
                                setRiskFilter(event.target.value)
                            }
                        >
                            <option>All Risk Levels</option>
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                            <option>Critical</option>
                        </select>
                    </div>

                    <div className="filter-control">
                        <span>↕</span>

                        <select
                            value={sortOrder}
                            onChange={(event) =>
                                setSortOrder(event.target.value)
                            }
                        >
                            <option value="newest">
                                Newest First
                            </option>

                            <option value="oldest">
                                Oldest First
                            </option>
                        </select>
                    </div>

                    <button
                        className="new-analysis-button"
                        onClick={() => navigate("/detect")}
                    >
                        <span>＋</span>
                        New Analysis
                    </button>
                </section>

                {/* =====================================================
                    Content
                ====================================================== */}

                {loading && (
                    <div className="reports-state">
                        <div className="state-icon">◌</div>
                        <h2>Loading Reports</h2>
                        <p>
                            Please wait while we load your crop health
                            history.
                        </p>
                    </div>
                )}

                {error && !loading && (
                    <div className="reports-state reports-state-error">
                        <div className="state-icon">!</div>

                        <h2>Unable to Load Reports</h2>

                        <p>{error}</p>
                    </div>
                )}

                {!loading && !error && reports.length === 0 && (
                    <div className="reports-state">
                        <div className="state-icon">▤</div>

                        <h2>No Disease Reports Yet</h2>

                        <p>
                            Upload a crop image to generate your first
                            disease detection report.
                        </p>

                        <button
                            className="empty-analysis-button"
                            onClick={() => navigate("/detect")}
                        >
                            Start New Analysis
                        </button>
                    </div>
                )}

                {!loading &&
                    !error &&
                    reports.length > 0 &&
                    filteredReports.length === 0 && (
                        <div className="reports-state">
                            <div className="state-icon">⌕</div>

                            <h2>No Matching Reports</h2>

                            <p>
                                Try changing your search or filter
                                options.
                            </p>

                            <button
                                className="clear-filter-button"
                                onClick={() => {
                                    setSearch("");
                                    setCropFilter("All Crops");
                                    setRiskFilter("All Risk Levels");
                                }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}

                {!loading &&
                    !error &&
                    filteredReports.length > 0 && (
                        <>
                            <section className="reports-grid">
                                {filteredReports.map((report) => (
                                    <article
                                        className="report-card"
                                        key={report._id}
                                    >
                                        <div className="report-card-top">
                                            <div className="report-image-wrapper">
                                                <img
                                                    src={report.image}
                                                    alt={`${report.crop || "Crop"} analysis`}
                                                    className="report-image"
                                                />
                                            </div>

                                            <div className="report-title-area">
                                                <h2>
                                                    {report.disease ||
                                                        "Unknown Disease"}
                                                </h2>

                                                <span
                                                    className={`risk-badge ${getRiskClass(
                                                        report.riskLevel
                                                    )}`}
                                                >
                                                    <span>
                                                        {getRiskIcon(
                                                            report.riskLevel
                                                        )}
                                                    </span>

                                                    {report.riskLevel ||
                                                        "Low"}{" "}
                                                    Risk
                                                </span>
                                            </div>
                                        </div>

                                        <div className="report-details">
                                            <div className="report-detail">
                                                <span className="detail-icon">
                                                    ♧
                                                </span>

                                                <div>
                                                    <strong>
                                                        {report.crop ||
                                                            "--"}
                                                    </strong>

                                                    <small>Crop</small>
                                                </div>
                                            </div>

                                            <div className="report-detail">
                                                <span className="detail-icon">
                                                    ✓
                                                </span>

                                                <div>
                                                    <strong>
                                                        {report.confidence ??
                                                            "--"}
                                                        %
                                                    </strong>

                                                    <small>
                                                        Confidence
                                                    </small>
                                                </div>
                                            </div>

                                            <div className="report-detail">
                                                <span className="detail-icon calendar-icon">
                                                    ▣
                                                </span>

                                                <div>
                                                    <strong>
                                                        {formatDate(
                                                            report.createdAt
                                                        )}
                                                    </strong>

                                                    <small>
                                                        {formatTime(
                                                            report.createdAt
                                                        )}
                                                    </small>
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            className="view-report-button"
                                            onClick={() =>
                                                openReport(report._id)
                                            }
                                        >
                                            <span>◉</span>
                                            View Report
                                            <span className="view-arrow">
                                                ›
                                            </span>
                                        </button>
                                    </article>
                                ))}
                            </section>

                            <div className="reports-footer">
                                <span>
                                    Showing{" "}
                                    <strong>
                                        {filteredReports.length}
                                    </strong>{" "}
                                    of {reports.length} reports
                                </span>

                                <div className="pagination">
                                    <button disabled>‹</button>
                                    <button className="active-page">
                                        1
                                    </button>
                                    <button disabled>›</button>
                                </div>
                            </div>
                        </>
                    )}
            </main>
        </div>
    );
}

export default Reports;