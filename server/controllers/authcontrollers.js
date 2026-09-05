const authService = require("../services/authservice");
const otpService = require("../services/otpservice");

const verifiedMobiles = new Set();

const verifyOTP = async (req, res) => {
    try {
        const { mobile, otp } = req.body || {};

        if (!mobile || !otp) {
            return res.status(400).json({
                success: false,
                message: "Mobile number and OTP are required"
            });
        }

        await otpService.verifyOTP(mobile, otp);

        verifiedMobiles.add(mobile);

        res.status(200).json({
            success: true,
            message: "OTP verified successfully"
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const register = async (req, res) => {
    try {
        const { name, mobile, password } =
            req.body || {};

        if (!name || !mobile || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Name, mobile and password are required"
            });
        }

        if (!/^[0-9]{10}$/.test(mobile)) {
            return res.status(400).json({
                success: false,
                message:
                    "Enter a valid 10-digit mobile number"
            });
        }

        if (!verifiedMobiles.has(mobile)) {
            return res.status(400).json({
                success: false,
                message:
                    "Please verify your mobile number first"
            });
        }

        const user =
            await authService.registerUser({
                name,
                mobile,
                password
            });

        verifiedMobiles.delete(mobile);

        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user
        });

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const login = async (req, res) => {
    try {
        const { mobile, password } =
            req.body || {};

        if (!mobile || !password) {
            return res.status(400).json({
                success: false,
                message:
                    "Mobile number and password are required"
            });
        }

        const result =
            await authService.loginUser(
                mobile,
                password
            );

        res.status(200).json({
            success: true,
            message: "Login successful",
            token: result.token,
            user: result.user
        });

    } catch (error) {
        res.status(401).json({
            success: false,
            message: error.message
        });
    }
};

const getMe = async (req, res) => {
    res.status(200).json({
        success: true,
        user: req.user
    });
};

module.exports = {
    register,
    login,
    verifyOTP,
    getMe
};