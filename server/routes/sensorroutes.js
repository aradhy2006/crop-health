const express = require("express");

const {
    createSensorReading,
    getSensorReadings,
    getLatestSensorReading,
    getMyDevice
} = require("../controllers/sensorcontrollers");

const authMiddleware = require("../middleware/authmiddleware");

const router = express.Router();

// ESP32 sends sensor data
router.post(
    "/readings",
    createSensorReading
);

// Get device belonging to logged-in farmer
router.get(
    "/my-device",
    authMiddleware,
    getMyDevice
);

// Farmer dashboard reads latest sensor data
router.get(
    "/readings/:deviceId/latest",
    authMiddleware,
    getLatestSensorReading
);

// Farmer dashboard reads all sensor data
router.get(
    "/readings/:deviceId",
    authMiddleware,
    getSensorReadings
);

module.exports = router;