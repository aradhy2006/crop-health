const express = require("express");

const {
    createSensorReading
} = require("../controllers/sensorcontrollers");

const router = express.Router();

router.post("/readings", createSensorReading);

module.exports = router;