const express = require("express");

const {
    createFarm,
    getMyFarms,
    updateFarm
} = require("../controllers/farmcontrollers");

const authMiddleware = require("../middleware/authmiddleware");

const router = express.Router();

router.post("/", authMiddleware, createFarm);

router.get("/", authMiddleware, getMyFarms);

router.put(
    "/:farmId",
    authMiddleware,
    updateFarm
);

module.exports = router;