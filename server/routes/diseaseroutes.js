const express = require("express");

const {
    analyzeDisease,
    getMyReports,
    getReportById,
    getReportPage
} = require("../controllers/diseasecontroller");

const authMiddleware =
    require("../middleware/authmiddleware");

const upload =
    require("../middleware/uploadmiddleware");

const router = express.Router();


// Analyze crop image
router.post(
    "/analyze",
    authMiddleware,
    upload.single("image"),
    analyzeDisease
);


// Get reports of the logged-in farmer
router.get(
    "/reports",
    authMiddleware,
    getMyReports
);


// Get a single disease report
router.get(
    "/reports/:reportId",
    authMiddleware,
    getReportById
);

// Public human-readable report page
router.get(
    "/report-page/:reportId",
    getReportPage
);


module.exports = router;