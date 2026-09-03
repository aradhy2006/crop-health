const express = require("express");

const {
    createSensorReading,
    getSensorReadings,
    getLatestSensorReading
} = require("../controllers/sensorcontrollers");

const router = express.Router();

router.post("/readings", createSensorReading);

router.get("/readings/:deviceId/latest", getLatestSensorReading);

router.get("/readings/:deviceId", getSensorReadings);

module.exports = router;