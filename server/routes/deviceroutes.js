const express = require("express");

const {
    registerDevice,
    getDevice
} = require("../controllers/devicecontrollers");

const router = express.Router();

router.post("/", registerDevice);

router.get("/:deviceId", getDevice);

module.exports = router;