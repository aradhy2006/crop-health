const express = require("express");

const {
    createFarm,
    getMyFarms
} = require("../controllers/farmcontrollers");

const authMiddleware = require("../middleware/authmiddleware");

const router = express.Router();

router.post("/", authMiddleware, createFarm);
router.get("/", authMiddleware, getMyFarms);

module.exports = router;