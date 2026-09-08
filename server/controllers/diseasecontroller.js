const diseaseDetectionService = require("../services/diseasedetectionservice");
const path = require("path");

const isHealthyDiseaseName = (disease) => {
    const name = String(disease || "").toLowerCase();
    return name.includes("healthy") || name.includes("no disease");
};

const analyzeDisease = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Crop image is required",
            });
        }

        const {
            farmId,
            crop,
            temperature,
            humidity,
            soilMoisture,
        } = req.body;

        if (!farmId || !crop) {
            return res.status(400).json({
                success: false,
                message: "Farm and crop are required",
            });
        }

        const farmerId =
            req.user.userId ||
            req.user._id ||
            req.user.id;

        if (!farmerId) {
            return res.status(401).json({
                success: false,
                message:
                    "Unauthorized: Farmer ID missing from request user",
            });
        }

        const localImagePath = path.resolve(req.file.path);

        console.log(
            "Uploaded file path:",
            req.file.path
        );

        console.log(
            "Local image path:",
            localImagePath
        );

        const sensorReadings = {
            temperature:
                temperature !== undefined &&
                temperature !== ""
                    ? Number(temperature)
                    : undefined,

            humidity:
                humidity !== undefined &&
                humidity !== ""
                    ? Number(humidity)
                    : undefined,

            soilMoisture:
                soilMoisture !== undefined &&
                soilMoisture !== ""
                    ? Number(soilMoisture)
                    : undefined,
        };

        const publicImageUrl =
            `${process.env.PUBLIC_REPORT_BASE_URL || ""}/` +
            `${req.file.path.replace(/\\/g, "/")}`;

        const report =
            await diseaseDetectionService.analyzeCrop({
                farmerId,
                farmId: farmId.trim(),
                crop: crop.trim(),
                imagePath: localImagePath,
                imageUrl: publicImageUrl,
                sensorReadings,
            });

        return res.status(201).json({
            success: true,
            message: "Crop analyzed successfully",
            report,
        });
    } catch (error) {
        console.error(
            "Analyze Disease Controller Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to analyze crop disease",
        });
    }
};

const getMyReports = async (req, res) => {
    try {
        const farmerId =
            req.user.userId ||
            req.user._id ||
            req.user.id;

        if (!farmerId) {
            return res.status(401).json({
                success: false,
                message:
                    "Unauthorized: Farmer ID missing from request user",
            });
        }

        const reports =
            await diseaseDetectionService.getMyReports(
                farmerId
            );

        return res.status(200).json({
            success: true,
            reports,
        });
    } catch (error) {
        console.error(
            "Get My Disease Reports Error:",
            error
        );

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Failed to fetch disease reports",
        });
    }
};

const getReportById = async (req, res) => {
    try {
        const { reportId } = req.params;

        const report =
            await diseaseDetectionService.getReportById(
                reportId
            );

        return res.status(200).json({
            success: true,
            report,
        });
    } catch (error) {
        console.error(
            "Get Disease Report Error:",
            error
        );

        return res.status(404).json({
            success: false,
            message:
                error.message ||
                "Disease report not found",
        });
    }
};

const getReportPage = async (req, res) => {
    try {
        const { reportId } = req.params;

        const report =
            await diseaseDetectionService.getReportById(
                reportId
            );

        const preventionItems =
            Array.isArray(report.prevention)
                ? report.prevention
                : [];

        const preventionList = preventionItems.length
            ? preventionItems
                  .map(
                      (item) => `
                        <li>
                            <span class="check">✓</span>
                            <span>${item}</span>
                        </li>
                    `
                  )
                  .join("")
            : `
                <li>
                    <span class="check">✓</span>
                    <span>
                        No prevention information available.
                    </span>
                </li>
            `;

        const riskLevel = isHealthyDiseaseName(report.disease)
            ? "Low"
            : String(report.riskLevel || "Low");

        const riskClass =
            riskLevel.toLowerCase();

        const temperature =
            report.sensorReadings?.temperature ?? "N/A";

        const humidity =
            report.sensorReadings?.humidity ?? "N/A";

        const soilMoisture =
            report.sensorReadings?.soilMoisture ?? "N/A";

        const reportDate = report.createdAt
            ? new Date(
                  report.createdAt
              ).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
              })
            : "N/A";

        const expectedSpread = isHealthyDiseaseName(report.disease)
            ? "None"
            : (report.expectedSpread ||
                "No spread information is available for this report.");

        const reportDateTime = report.createdAt
            ? new Date(
                  report.createdAt
              ).toLocaleString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
              })
            : "N/A";

        const confidence = Math.max(
            0,
            Math.min(
                100,
                Number(report.confidence) || 0
            )
        );

        const sensorFactors = Array.isArray(report.sensorFactors) ? report.sensorFactors : [];
        const sensorFactorsHtml = sensorFactors.length > 0
            ? `
            <div style="margin-top: 18px; padding: 14px 18px; background: #fff8e6; border: 1px solid #f6d899; border-radius: 12px;">
                <strong style="color: #945700; display: block; font-size: 14px; margin-bottom: 6px;">
                    ⚠️ Environmental Warnings & Stress Factors:
                </strong>
                <ul style="margin: 0; padding-left: 18px; color: #784500; font-size: 13.5px; line-height: 1.5;">
                    ${sensorFactors.map(f => `<li style="margin-bottom: 4px;">${f}</li>`).join("")}
                </ul>
                ${report.riskConditions ? `<p style="margin: 6px 0 0; color: #945700; font-style: italic; font-size: 12px;">${report.riskConditions}</p>` : ""}
            </div>
            `
            : "";

        return res.send(`
<!DOCTYPE html>
<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <meta
        name="theme-color"
        content="#155d36"
    >

    <meta
        name="description"
        content="Crop Health Manager disease analysis report"
    >

    <title>Crop Health Report</title>

    <style>

        * {
            box-sizing: border-box;
        }

        :root {
            --green-dark: #124b2e;
            --green: #18843f;
            --green-light: #e6f5e9;
            --green-border: #cce6d1;

            --text: #152f26;
            --muted: #64746c;

            --background: #f2f8f4;
            --white: #ffffff;

            --border: #dce9df;

            --yellow-bg: #fff8e4;
            --yellow-border: #f0dfad;
            --yellow-text: #795900;

            --blue-bg: #eef6ff;
            --blue-border: #d5e5f7;
            --blue-text: #155da5;

            --purple-bg: #f5efff;
            --purple-border: #dfd3f1;
            --purple-text: #603a98;

            --red-bg: #ffe9e9;
            --red-border: #f2cccc;
            --red-text: #bc2424;
        }

        html {
            scroll-behavior: smooth;
        }

        body {
            margin: 0;
            background:
                radial-gradient(
                    circle at 10% 10%,
                    rgba(50, 150, 82, 0.08),
                    transparent 28%
                ),
                radial-gradient(
                    circle at 90% 25%,
                    rgba(85, 165, 100, 0.07),
                    transparent 25%
                ),
                var(--background);

            color: var(--text);

            font-family:
                Inter,
                "Segoe UI",
                Roboto,
                Helvetica,
                Arial,
                sans-serif;
        }

        .page {
            min-height: 100vh;
            overflow: hidden;
        }

        .container {
            width: min(1180px, calc(100% - 36px));
            margin: 0 auto;
            padding-bottom: 45px;
        }

        .hero {
            position: relative;
            overflow: hidden;

            min-height: 345px;

            margin: 0 -18px 0;

            padding: 31px 55px 90px;

            color: white;

            background:
                linear-gradient(
                    135deg,
                    #0d4d30 0%,
                    #176b3c 45%,
                    #2c7c43 100%
                );
        }

        .hero-grid {
            position: relative;
            z-index: 2;
        }

        .top-row {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;

            gap: 25px;
        }

        .brand {
            display: flex;
            align-items: center;

            gap: 13px;
        }

        .brand-logo {
            width: 50px;
            height: 50px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 15px;

            background: rgba(255,255,255,0.13);

            border: 1px solid rgba(255,255,255,0.24);

            font-size: 26px;
        }

        .brand-name {
            font-size: 22px;
            font-weight: 800;
        }

        .brand-tagline {
            margin-top: 2px;
            color: rgba(255,255,255,0.76);
            font-size: 13px;
        }

        .report-id {
            min-width: 225px;

            padding: 11px 15px;

            border-radius: 13px;

            background: rgba(255,255,255,0.10);

            border: 1px solid rgba(255,255,255,0.28);
        }

        .report-id-label {
            display: block;
            color: rgba(255,255,255,0.65);
            font-size: 11px;
            margin-bottom: 2px;
        }

        .report-id-value {
            display: block;
            color: white;
            font-size: 13px;
            font-weight: 700;
            word-break: break-all;
        }

        .hero-title {
            margin: 65px 0 6px;

            font-size: clamp(38px, 5vw, 58px);
            line-height: 1;
            font-weight: 800;
        }

        .hero-subtitle {
            margin: 0;
            font-size: 18px;
            font-weight: 600;
            color: rgba(255,255,255,0.94);
        }

        .hero-description {
            margin: 8px 0 0;
            color: rgba(255,255,255,0.68);
            font-size: 13px;
        }

        .diagnosis-card {
            position: relative;
            z-index: 5;

            display: grid;

            grid-template-columns:
                280px
                minmax(300px, 1fr)
                175px;

            gap: 30px;

            align-items: center;

            margin-top: -75px;

            padding: 21px;

            background: rgba(255,255,255,0.98);

            border: 1px solid #d9e7dd;

            border-radius: 22px;

            box-shadow:
                0 18px 40px rgba(25, 78, 45, 0.13);
        }

        .crop-image-box {
            position: relative;

            height: 275px;

            overflow: hidden;

            border-radius: 17px;

            background: #eaf3ec;

            border: 1px solid #d7e6da;
        }

        .crop-image {
            width: 100%;
            height: 100%;
            display: block;
            object-fit: cover;
        }

        .image-label {
            position: absolute;

            left: 13px;
            bottom: 13px;

            padding: 9px 13px;

            border-radius: 10px;

            background: rgba(17, 43, 31, 0.78);

            color: white;

            font-size: 12px;
            font-weight: 700;
        }

        .diagnosis-content {
            min-width: 0;
        }

        .diagnosis-pill {
            display: inline-flex;

            align-items: center;

            gap: 7px;

            padding: 7px 13px;

            border-radius: 999px;

            background: var(--green-light);

            border: 1px solid var(--green-border);

            color: var(--green);

            font-size: 12px;

            font-weight: 800;

            text-transform: uppercase;
        }

        .diagnosis-content h2 {
            margin: 16px 0 3px;

            color: var(--text);

            font-size: clamp(31px, 4vw, 43px);

            line-height: 1.1;
        }

        .detected {
            margin: 0 0 15px;
            color: #42564c;
            font-size: 17px;
            font-weight: 650;
        }

        .diagnosis-description {
            margin: 0;
            color: var(--muted);
            font-size: 14px;
            line-height: 1.75;
        }

        .confidence-area {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 14px;
        }

        .confidence-ring {
            position: relative;

            width: 122px;
            height: 122px;

            display: flex;

            align-items: center;
            justify-content: center;

            border-radius: 50%;

            background:
                conic-gradient(
                    #22a447 ${confidence * 3.6}deg,
                    #dcece0 ${confidence * 3.6}deg
                );
        }

        .confidence-ring::before {
            content: "";

            position: absolute;

            width: 94px;
            height: 94px;

            border-radius: 50%;

            background: white;
        }

        .confidence-number {
            position: relative;
            z-index: 2;

            color: var(--text);

            font-size: 25px;

            font-weight: 800;
        }

        .confidence-label {
            margin-top: -7px;
            color: var(--muted);
            font-size: 12px;
            font-weight: 650;
            text-align: center;
        }

        .risk-box {
            width: 100%;
            padding: 12px 10px;
            border-radius: 11px;
            text-align: center;
            font-size: 13px;
            font-weight: 800;
        }

        .risk-box.low {
            background: #e8f6eb;
            color: #247335;
            border: 1px solid #cce6d1;
        }

        .risk-box.medium {
            background: #fff4d4;
            color: #7d6008;
            border: 1px solid #efddaa;
        }

        .risk-box.high {
            background: var(--red-bg);
            color: var(--red-text);
            border: 1px solid var(--red-border);
        }

        .risk-box.critical {
            background: #f9dddd;
            color: #8d1717;
            border: 1px solid #e8b7b7;
        }

        .section-card {
            margin-top: 18px;
            padding: 24px;
            background: white;
            border: 1px solid var(--border);
            border-radius: 17px;
            box-shadow:
                0 5px 18px rgba(28, 73, 45, 0.055);
        }

        .section-heading {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 19px;
        }

        .section-icon {
            width: 42px;
            height: 42px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 12px;

            background: var(--green-light);

            border: 1px solid var(--green-border);

            font-size: 20px;
        }

        .section-heading h2 {
            margin: 0;
            color: var(--text);
            font-size: 20px;
        }

        .section-heading p {
            margin: 3px 0 0;
            color: var(--muted);
            font-size: 12px;
        }

        .details-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 14px;
        }

        .detail-box {
            padding: 16px 17px;
            border-radius: 12px;

            background:
                linear-gradient(
                    135deg,
                    #f8fbf8,
                    #f5faf6
                );

            border: 1px solid #e1ebe3;
        }

        .detail-label {
            display: block;
            margin-bottom: 4px;
            color: #728078;
            font-size: 11px;
            font-weight: 750;
            text-transform: uppercase;
        }

        .detail-value {
            display: block;
            color: var(--text);
            font-size: 16px;
            font-weight: 750;
        }

        .sensor-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 15px;
        }

        .sensor-card {
            min-height: 140px;
            padding: 19px;
            border-radius: 15px;
            border: 1px solid;
            display: flex;
            flex-direction: column;
            justify-content: center;
        }

        .sensor-card.temperature {
            background: linear-gradient(135deg, #fff6f2, #fdf0eb);
            border-color: #f0ddd6;
        }

        .sensor-card.humidity {
            background: linear-gradient(135deg, #f1f8ff, #edf5fd);
            border-color: #dce9f5;
        }

        .sensor-card.soil {
            background: linear-gradient(135deg, #f5f8ed, #eff5e6);
            border-color: #dfe8d2;
        }

        .sensor-icon {
            font-size: 25px;
            margin-bottom: 9px;
        }

        .sensor-name {
            color: #53645b;
            font-size: 12px;
            font-weight: 650;
        }

        .sensor-value {
            margin-top: 2px;
            color: var(--text);
            font-size: 24px;
            font-weight: 800;
        }

        .insight-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
            margin-top: 18px;
        }

        .insight-card {
            min-height: 190px;
            padding: 23px;
            border-radius: 18px;
            border: 1px solid;
        }

        .insight-card.why {
            background: var(--yellow-bg);
            border-color: var(--yellow-border);
        }

        .insight-card.spread {
            background: var(--blue-bg);
            border-color: var(--blue-border);
        }

        .insight-card.solution {
            background: #eef9f0;
            border-color: #d3e9d6;
        }

        .insight-card.prevention {
            background: var(--purple-bg);
            border-color: var(--purple-border);
        }

        .insight-heading {
            display: flex;
            align-items: center;
            gap: 11px;
            margin-bottom: 15px;
        }

        .insight-icon {
            width: 40px;
            height: 40px;

            display: flex;
            align-items: center;
            justify-content: center;

            border-radius: 50%;

            background: white;

            font-size: 19px;
        }

        .insight-heading h2 {
            margin: 0;
            font-size: 19px;
        }

        .why .insight-heading h2 {
            color: var(--yellow-text);
        }

        .spread .insight-heading h2 {
            color: var(--blue-text);
        }

        .solution .insight-heading h2 {
            color: #17643a;
        }

        .prevention .insight-heading h2 {
            color: var(--purple-text);
        }

        .insight-text {
            margin: 0;
            color: #425149;
            font-size: 14px;
            line-height: 1.75;
        }

        .prevention-list {
            list-style: none;
            margin: 0;
            padding: 0;
        }

        .prevention-list li {
            display: flex;
            align-items: flex-start;
            gap: 9px;
            margin-bottom: 10px;
            color: #425149;
            font-size: 14px;
            line-height: 1.55;
        }

        .check {
            width: 21px;
            height: 21px;

            display: inline-flex;

            align-items: center;
            justify-content: center;

            flex-shrink: 0;

            border-radius: 50%;

            background: #e9dcff;

            color: var(--purple-text);

            font-size: 11px;

            font-weight: 800;
        }

        .report-details {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 13px;
        }

        .report-detail {
            padding: 15px 17px;
            border-radius: 11px;
            background: #f8faf8;
            border: 1px solid #e2e9e3;
        }

        .report-detail span {
            display: block;
            margin-bottom: 4px;
            color: #748078;
            font-size: 11px;
            font-weight: 650;
        }

        .report-detail strong {
            display: block;
            color: var(--text);
            font-size: 13px;
            word-break: break-word;
        }

        .footer {
            position: relative;
            overflow: hidden;
            margin-top: 25px;
            padding: 35px 25px 31px;
            text-align: center;

            border-radius: 20px;
            border: 1px solid #cfe5d2;

            background:
                linear-gradient(
                    170deg,
                    #eaf8eb,
                    #dcefdc
                );
        }

        .footer-content {
            position: relative;
            z-index: 2;
        }

        .footer-leaf {
            font-size: 32px;
            margin-bottom: 6px;
        }

        .footer-title {
            margin: 0;
            color: var(--green-dark);
            font-family: Georgia, serif;
            font-size: 25px;
            font-style: italic;
        }

        .footer-text {
            margin: 8px 0 0;
            color: #5c7165;
            font-size: 13px;
        }

        .footer-brand {
            margin-top: 18px;
            color: var(--green-dark);
            font-size: 16px;
            font-weight: 800;
        }

        @media (max-width: 900px) {
            .hero {
                padding-left: 35px;
                padding-right: 35px;
            }

            .diagnosis-card {
                grid-template-columns:
                    230px
                    minmax(250px, 1fr)
                    155px;

                gap: 20px;
            }

            .crop-image-box {
                height: 240px;
            }
        }

        @media (max-width: 720px) {
            .container {
                width: calc(100% - 16px);
            }

            .hero {
                min-height: 330px;
                margin-left: -8px;
                margin-right: -8px;
                padding: 22px 18px 85px;
            }

            .top-row {
                flex-direction: column;
                gap: 18px;
            }

            .report-id {
                width: 100%;
                min-width: 0;
            }

            .hero-title {
                margin-top: 45px;
                font-size: 36px;
                line-height: 1.05;
            }

            .hero-subtitle {
                font-size: 15px;
                line-height: 1.5;
            }

            .diagnosis-card {
                grid-template-columns: 1fr;
                gap: 20px;
                margin-top: -55px;
                padding: 14px;
                border-radius: 18px;
            }

            .crop-image-box {
                height: 250px;
            }

            .diagnosis-content {
                padding: 3px 7px;
            }

            .diagnosis-content h2 {
                font-size: 31px;
            }

            .confidence-area {
                display: grid;
                grid-template-columns: 125px 1fr;
                align-items: center;
                gap: 17px;
                padding: 5px 8px 8px;
            }

            .section-card {
                padding: 19px 16px;
                border-radius: 15px;
            }

            .details-grid,
            .report-details {
                grid-template-columns: 1fr;
            }

            .sensor-grid {
                grid-template-columns: 1fr;
            }

            .insight-grid {
                grid-template-columns: 1fr;
                gap: 14px;
            }

            .insight-card {
                min-height: auto;
                padding: 19px;
            }

            .footer {
                padding-left: 17px;
                padding-right: 17px;
            }
        }

        @media (max-width: 390px) {
            .brand-name {
                font-size: 19px;
            }

            .hero-title {
                font-size: 32px;
            }

            .diagnosis-content h2 {
                font-size: 28px;
            }

            .confidence-area {
                grid-template-columns: 1fr;
            }
        }

    </style>

</head>

<body>

<div class="page">

    <div class="container">

        <header class="hero">

            <div class="hero-grid">

                <div class="top-row">

                    <div class="brand">

                        <div class="brand-logo">
                            🌱
                        </div>

                        <div>

                            <div class="brand-name">
                                CropHealth
                            </div>

                            <div class="brand-tagline">
                                Smart Farming for a Healthier Tomorrow
                            </div>

                        </div>

                    </div>

                    <div class="report-id">

                        <span class="report-id-label">
                            REPORT ID
                        </span>

                        <span class="report-id-value">
                            #${report._id}
                        </span>

                    </div>

                </div>

                <h1 class="hero-title">
                    Crop Health Report
                </h1>

                <p class="hero-subtitle">
                    AI-Assisted Disease Detection for Healthier Crops
                </p>

                <p class="hero-description">
                    Smart crop analysis using disease detection and environmental observations.
                </p>

            </div>

        </header>

        <section class="diagnosis-card">

            <div class="crop-image-box">

                <img
                    src="${report.image}"
                    alt="Analyzed crop"
                    class="crop-image"
                >

                <div class="image-label">
                    📷 &nbsp; Analyzed Crop Image
                </div>

            </div>

            <div class="diagnosis-content">

                <div class="diagnosis-pill">
                    ✣ &nbsp; Diagnosis
                </div>

                <h2>
                    ${report.disease}
                </h2>

                <p class="detected">
                    Detected in ${report.crop}
                </p>

                <p class="diagnosis-description">
                    ${
                        report.whyItHappens ||
                        "The detected condition requires attention based on the crop analysis."
                    }
                </p>

            </div>

            <div class="confidence-area">

                <div>

                    <div class="confidence-ring">

                        <span class="confidence-number">
                            ${confidence.toFixed(2)}%
                        </span>

                    </div>

                    <div class="confidence-label">
                        AI Confidence
                    </div>

                </div>

                <div class="risk-box ${riskClass}">
                    ⚠ &nbsp; ${riskLevel} Risk
                </div>

            </div>

        </section>

        <section class="section-card">

            <div class="section-heading">

                <div class="section-icon">
                    🌿
                </div>

                <div>

                    <h2>
                        Crop & Analysis Details
                    </h2>

                    <p>
                        Information associated with this report
                    </p>

                </div>

            </div>

            <div class="details-grid">

                <div class="detail-box">

                    <span class="detail-label">
                        Crop
                    </span>

                    <span class="detail-value">
                        ${report.crop}
                    </span>

                </div>

                <div class="detail-box">

                    <span class="detail-label">
                        Report Date
                    </span>

                    <span class="detail-value">
                        ${reportDate}
                    </span>

                </div>

            </div>

        </section>

        <section class="section-card">

            <div class="section-heading">

                <div class="section-icon">
                    🌡️
                </div>

                <div>

                    <h2>
                        Environmental Conditions
                    </h2>

                    <p>
                        Sensor readings recorded at the time of analysis
                    </p>

                </div>

            </div>

            <div class="sensor-grid">

                <div class="sensor-card temperature">

                    <div class="sensor-icon">
                        🌡️
                    </div>

                    <span class="sensor-name">
                        Temperature
                    </span>

                    <strong class="sensor-value">
                        ${temperature} °C
                    </strong>

                </div>

                <div class="sensor-card humidity">

                    <div class="sensor-icon">
                        💧
                    </div>

                    <span class="sensor-name">
                        Humidity
                    </span>

                    <strong class="sensor-value">
                        ${humidity} %
                    </strong>

                </div>

                <div class="sensor-card soil">

                    <div class="sensor-icon">
                        🌱
                    </div>

                    <span class="sensor-name">
                        Soil Moisture
                    </span>

                    <strong class="sensor-value">
                        ${soilMoisture} %
                    </strong>

                </div>

            </div>

            ${sensorFactorsHtml}

        </section>

        <div class="insight-grid">

            <section class="insight-card why">

                <div class="insight-heading">

                    <div class="insight-icon">
                        ❓
                    </div>

                    <h2>
                        Why is this happening?
                    </h2>

                </div>

                <p class="insight-text">
                    ${
                        report.whyItHappens ||
                        "No explanation is available for this report."
                    }
                </p>

            </section>

            <section class="insight-card spread">

                <div class="insight-heading">

                    <div class="insight-icon">
                        ↗
                    </div>

                    <h2>
                        Expected Spread
                    </h2>

                </div>

                <p class="insight-text">
                    ${
                        expectedSpread
                    }
                </p>

            </section>

            <section class="insight-card solution">

                <div class="insight-heading">

                    <div class="insight-icon">
                        💡
                    </div>

                    <h2>
                        Recommended Solution
                    </h2>

                </div>

                <p class="insight-text">
                    ${
                        report.solution ||
                        "No recommended solution is available for this report."
                    }
                </p>

            </section>

            <section class="insight-card prevention">

                <div class="insight-heading">

                    <div class="insight-icon">
                        🛡️
                    </div>

                    <h2>
                        Prevention Tips
                    </h2>

                </div>

                <ul class="prevention-list">
                    ${preventionList}
                </ul>

            </section>

        </div>

        <section class="section-card">

            <div class="section-heading">

                <div class="section-icon">
                    📄
                </div>

                <div>

                    <h2>
                        Report Details
                    </h2>

                    <p>
                        Reference information for this analysis
                    </p>

                </div>

            </div>

            <div class="report-details">

                <div class="report-detail">

                    <span>
                        Report ID
                    </span>

                    <strong>
                        ${report._id}
                    </strong>

                </div>

                <div class="report-detail">

                    <span>
                        Generated
                    </span>

                    <strong>
                        ${reportDateTime}
                    </strong>

                </div>

                <div class="report-detail">

                    <span>
                        Status
                    </span>

                    <strong>
                        ${report.status || "Generated"}
                    </strong>

                </div>

                <div class="report-detail">

                    <span>
                        Analysis Type
                    </span>

                    <strong>
                        AI-assisted crop disease analysis
                    </strong>

                </div>

            </div>

        </section>

        <footer class="footer">

            <div class="footer-content">

                <div class="footer-leaf">
                    🌱
                </div>

                <h2 class="footer-title">
                    Together for Healthier Harvests
                </h2>

                <p class="footer-text">
                    Smart technology. Better crop awareness. Stronger farming decisions.
                </p>

                <div class="footer-brand">
                    CropHealth
                </div>

            </div>

        </footer>

    </div>

</div>

</body>

</html>
        `);
    } catch (error) {
        console.error(
            "Disease Report Page Error:",
            error
        );

        return res.status(404).send(`
<!DOCTYPE html>

<html lang="en">

<head>

    <meta charset="UTF-8">

    <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
    >

    <title>Report Not Found</title>

</head>

<body>

    <div style="
        max-width:500px;
        margin:100px auto;
        padding:30px;
        text-align:center;
        font-family:Arial,sans-serif;
    ">

        <h1>
            Disease Report Not Found
        </h1>

        <p>
            ${error.message}
        </p>

    </div>

</body>

</html>
        `);
    }
};

module.exports = {
    analyzeDisease,
    getMyReports,
    getReportById,
    getReportPage,
};