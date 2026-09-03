const express = require("express");

const {
    analyzeDisease,
    getReportById,
    getReportPage
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

// JSON API
router.get(
    "/reports/:reportId",
    getReportById
);

// Human-readable public report page
router.get(
    "/report-page/:reportId",
    getReportPage
);

module.exports = router;