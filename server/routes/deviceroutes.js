const express = require("express");

const {
    registerDevice,
    getDevice
} = require("../controllers/devicecontrollers");

const authMiddleware = require("../middleware/authmiddleware");

const router = express.Router();

router.post("/", authMiddleware, registerDevice);

router.get("/:deviceId", authMiddleware, getDevice);

module.exports = router;