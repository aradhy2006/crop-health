import { useNavigate, useLocation } from "react-router-dom";
import authService from "../services/authservice";
import "./Navbar.css";

function Navbar() {
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        authService.logout();
        navigate("/login");
    };

    const isActive = (path) => {
        return location.pathname === path ||
            (path === "/farm" && location.pathname.startsWith("/farm/")) ||
            (path === "/reports" && location.pathname.startsWith("/reports/"));
    };

    return (
        <nav className="app-navbar">

            <div
                className="app-navbar-brand"
                onClick={() => navigate("/dashboard")}
            >
                <div className="app-navbar-logo">
                    🌱
                </div>

                <div className="app-navbar-title">
                    <strong>Crop Health</strong>
                    <span>Smart Crop Monitoring</span>
                </div>
            </div>

            <div className="app-navbar-links">

                <button
                    className={isActive("/dashboard") ? "active" : ""}
                    onClick={() => navigate("/dashboard")}
                >
                    Dashboard
                </button>

                <button
                    className={isActive("/farm") ? "active" : ""}
                    onClick={() => navigate("/farm")}
                >
                    Farm
                </button>

                <button
                    className={isActive("/detect") ? "active" : ""}
                    onClick={() => navigate("/detect")}
                >
                    Disease Detection
                </button>

                <button
                    className={isActive("/reports") ? "active" : ""}
                    onClick={() => navigate("/reports")}
                >
                    Reports
                </button>

            </div>

            <div className="app-navbar-right">

                <span className="app-navbar-user">
                    Farmer
                </span>

                <button
                    className="app-navbar-logout"
                    onClick={handleLogout}
                >
                    Logout
                </button>

            </div>

        </nav>
    );
}

export default Navbar;