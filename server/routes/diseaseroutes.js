const express = require("express");

const {
    analyzeDisease
} = require("../controllers/diseasecontroller");

const authMiddleware =
    require("../middleware/authmiddleware");

const upload =
    require("../middleware/uploadmiddleware");

const router = express.Router();

router.post(
    "/analyze",
    authMiddleware,
    upload.single("image"),
    analyzeDisease
);

module.exports = router;