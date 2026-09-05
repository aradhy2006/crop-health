import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authservice";
import "./login.css";

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        mobile: "",
        password: ""
    });

    const [error, setError] = useState("");
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

        if (!/^[0-9]{10}$/.test(formData.mobile)) {
            setError(
                "Please enter a valid 10-digit mobile number."
            );
            return;
        }

        setLoading(true);

        try {
            await authService.login(formData);

            navigate("/dashboard");

        } catch (error) {
            console.error("LOGIN ERROR:", error);

            setError(
                error.response?.data?.message ||
                error.message ||
                "Login failed"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page">

            <div className="login-card">

                <h1>Welcome Back</h1>

                <p className="login-subtitle">
                    Login to Crop Health Manager
                </p>

                {error && (
                    <div className="login-error">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="login-form-group">

                        <label>Mobile Number</label>

                        <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            placeholder="Enter 10-digit mobile number"
                            maxLength="10"
                            inputMode="numeric"
                            required
                        />

                    </div>

                    <div className="login-form-group">

                        <label>Password</label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            required
                        />

                    </div>

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading
                            ? "Logging in..."
                            : "Login"}
                    </button>

                </form>

                <p className="register-text">
                    Don't have an account?{" "}

                    <button
                        type="button"
                        className="register-link"
                        onClick={() =>
                            navigate("/register")
                        }
                    >
                        Register
                    </button>
                </p>

            </div>

        </div>
    );
}

export default Login;