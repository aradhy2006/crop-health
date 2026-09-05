import { useState } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authservice";
import "./register.css";

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: "",
        mobile: "",
        password: ""
    });

    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);

    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previousData) => ({
            ...previousData,
            [name]: value
        }));
    };

    // Send OTP
    const handleSendOTP = async () => {
        setError("");
        setMessage("");

        if (!formData.mobile) {
            setError("Please enter your mobile number.");
            return;
        }

        if (!/^[0-9]{10}$/.test(formData.mobile)) {
            setError("Please enter a valid 10-digit mobile number.");
            return;
        }

        try {
            const response = await authService.sendOTP(
                formData.mobile
            );

            setOtpSent(true);
            setMessage(response.message);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to send OTP."
            );
        }
    };

    // Verify OTP
    const handleVerifyOTP = async () => {
        setError("");
        setMessage("");

        if (!otp) {
            setError("Please enter the OTP.");
            return;
        }

        try {
            const response = await authService.verifyOTP(
                formData.mobile,
                otp
            );

            setOtpVerified(true);
            setMessage(response.message);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Invalid OTP."
            );
        }
    };

    // Register user
    const handleSubmit = async (event) => {
        event.preventDefault();

        setError("");
        setMessage("");

        if (!otpVerified) {
            setError("Please verify your mobile number first.");
            return;
        }

        try {
            const response =
                await authService.register(formData);

            setMessage(response.message);

            setFormData({
                name: "",
                mobile: "",
                password: ""
            });

            setOtp("");
            setOtpSent(false);
            setOtpVerified(false);

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Registration failed"
            );
        }
    };

    return (
        <div className="register-page">
            <div className="register-card">

                <h1>Create Account</h1>

                <p className="register-subtitle">
                    Join Crop Health Manager
                </p>

                {error && (
                    <div className="error-message">
                        {error}
                    </div>
                )}

                {message && (
                    <div className="success-message">
                        {message}
                    </div>
                )}

                <form onSubmit={handleSubmit}>

                    {/* Name */}
                    <div className="form-group">
                        <label>Name</label>

                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="Enter your name"
                            required
                        />
                    </div>

                    {/* Mobile */}
                    <div className="form-group">
                        <label>Mobile Number</label>

                        <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile}
                            onChange={handleChange}
                            placeholder="Enter 10-digit mobile number"
                            maxLength="10"
                            required
                            disabled={otpVerified}
                        />
                    </div>

                    {/* Send OTP */}
                    {!otpVerified && (
                        <button
                            type="button"
                            className="otp-button"
                            onClick={handleSendOTP}
                        >
                            {otpSent ? "Resend OTP" : "Send OTP"}
                        </button>
                    )}

                    {/* OTP */}
                    {otpSent && !otpVerified && (
                        <div className="form-group otp-group">
                            <label>Enter OTP</label>

                            <input
                                type="text"
                                value={otp}
                                onChange={(event) =>
                                    setOtp(event.target.value)
                                }
                                placeholder="Enter 6-digit OTP"
                                maxLength="6"
                            />

                            <button
                                type="button"
                                className="verify-button"
                                onClick={handleVerifyOTP}
                            >
                                Verify OTP
                            </button>
                        </div>
                    )}

                    {/* Verified message */}
                    {otpVerified && (
                        <div className="verified-message">
                            ✓ Mobile number verified
                        </div>
                    )}

                    {/* Password */}
                    <div className="form-group">
                        <label>Password</label>

                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="Enter your password"
                            minLength="6"
                            required
                        />
                    </div>

                    {/* Register */}
                    <button
                        type="submit"
                        className="register-button"
                        disabled={!otpVerified}
                    >
                        Register
                    </button>

                </form>

                <p className="login-text">
                    Already have an account?{" "}

                    <button
                        type="button"
                        className="login-link"
                        onClick={() => navigate("/login")}
                    >
                        Login
                    </button>
                </p>

            </div>
        </div>
    );
}

export default Register;