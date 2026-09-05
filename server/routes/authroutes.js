const express = require("express");

const {
    register,
    login,
    verifyOTP,
    getMe
} = require("../controllers/authcontrollers");

const {
    sendOTP
} = require("../controllers/otpcontroller");

const authMiddleware =
    require("../middleware/authmiddleware");

const router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/register", register);
router.post("/login", login);
router.get("/me", authMiddleware, getMe);

module.exports = router;