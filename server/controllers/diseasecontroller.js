const diseaseDetectionService = require("../services/diseasedetectionservice");

const analyzeDisease = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: "Crop image is required"
            });
        }

        const {
            farmId,
            crop,
            temperature,
            humidity,
            soilMoisture
        } = req.body;

        if (!farmId || !crop) {
            return res.status(400).json({
                success: false,
                message: "Farm and crop are required"
            });
        }

        const farmerId = req.user.userId || req.user._id || req.user.id;

        if (!farmerId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Farmer ID missing from request user"
            });
        }

        const normalizedImagePath = req.file.path.replace(/\\/g, "/");

        const sensorReadings = {
            temperature: temperature ? Number(temperature) : undefined,
            humidity: humidity ? Number(humidity) : undefined,
            soilMoisture: soilMoisture ? Number(soilMoisture) : undefined
        };

        const report = await diseaseDetectionService.analyzeCrop({
            farmerId,
            farmId: farmId.trim(),
            crop: crop.trim(),
            imagePath: normalizedImagePath,
            sensorReadings
        });

        return res.status(201).json({
            success: true,
            message: "Crop analyzed successfully",
            report
        });

    } catch (error) {
        console.error("Analyze Disease Controller Error:", error);

        return res.status(500).json({
            success: false,
            message: error.message || "Failed to analyze crop disease"
        });
    }
};


const getReportById = async (req, res) => {
    try {
        const { reportId } = req.params;

        const report =
            await diseaseDetectionService.getReportById(reportId);

        return res.status(200).json({
            success: true,
            report
        });

    } catch (error) {
        console.error("Get Disease Report Error:", error);

        return res.status(404).json({
            success: false,
            message: error.message || "Disease report not found"
        });
    }
};


/*
 * Public human-readable disease report page.
 * This is the page that the QR code will eventually open.
 */
const getReportPage = async (req, res) => {
    try {
        const { reportId } = req.params;

        const report =
            await diseaseDetectionService.getReportById(reportId);

        const preventionList = report.prevention
            .map(item => `<li>${item}</li>`)
            .join("");

        const riskClass = report.riskLevel.toLowerCase();

        return res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>Crop Health Report</title>

    <style>
        * {
            box-sizing: border-box;
        }

        body {
            margin: 0;
            padding: 20px;
            font-family: Arial, sans-serif;
            background: #f4f7f2;
            color: #263326;
        }

        .container {
            max-width: 700px;
            margin: auto;
        }

        .header {
            background: #2e7d32;
            color: white;
            padding: 25px;
            border-radius: 18px;
            margin-bottom: 20px;
        }

        .header h1 {
            margin: 0 0 8px;
            font-size: 28px;
        }

        .header p {
            margin: 0;
            opacity: 0.9;
        }

        .card {
            background: white;
            padding: 22px;
            border-radius: 16px;
            margin-bottom: 16px;
            box-shadow: 0 3px 12px rgba(0,0,0,0.08);
        }

        .card h2 {
            margin-top: 0;
            color: #2e7d32;
        }

        .diagnosis {
            text-align: center;
        }

        .disease {
            font-size: 30px;
            font-weight: bold;
            margin: 10px 0;
        }

        .confidence {
            font-size: 18px;
            margin-bottom: 15px;
        }

        .risk {
            display: inline-block;
            padding: 8px 18px;
            border-radius: 20px;
            font-weight: bold;
        }

        .low {
            background: #d7f5dc;
            color: #176b2c;
        }

        .medium {
            background: #fff1c7;
            color: #856404;
        }

        .high {
            background: #ffd8d8;
            color: #a11a1a;
        }

        .critical {
            background: #f4b8b8;
            color: #7a0000;
        }

        .info-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
        }

        .info-box {
            background: #f4f7f2;
            padding: 15px;
            border-radius: 12px;
            text-align: center;
        }

        .info-box strong {
            display: block;
            font-size: 20px;
            margin-top: 5px;
        }

        li {
            margin-bottom: 10px;
        }

        .footer {
            text-align: center;
            color: #687368;
            font-size: 13px;
            padding: 15px;
        }

        @media (max-width: 500px) {
            .info-grid {
                grid-template-columns: 1fr;
            }

            .disease {
                font-size: 25px;
            }
        }
    </style>
</head>

<body>

<div class="container">

    <div class="header">
        <h1>🌾 Crop Health Report</h1>
        <p>Smart crop disease analysis</p>
    </div>


    <div class="card diagnosis">
        <h2>Diagnosis</h2>

        <div class="disease">
            ${report.disease}
        </div>

        <div class="confidence">
            AI Confidence: <strong>${report.confidence}%</strong>
        </div>

        <span class="risk ${riskClass}">
            Risk: ${report.riskLevel}
        </span>
    </div>


    <div class="card">
        <h2>🌱 Crop Information</h2>

        <p>
            <strong>Crop:</strong>
            ${report.crop}
        </p>

        <p>
            <strong>Report ID:</strong>
            ${report._id}
        </p>
    </div>


    <div class="card">
        <h2>🌡️ Sensor Conditions</h2>

        <div class="info-grid">

            <div class="info-box">
                🌡️ Temperature
                <strong>
                    ${report.sensorReadings?.temperature ?? "N/A"} °C
                </strong>
            </div>

            <div class="info-box">
                💧 Humidity
                <strong>
                    ${report.sensorReadings?.humidity ?? "N/A"} %
                </strong>
            </div>

            <div class="info-box">
                🌱 Soil Moisture
                <strong>
                    ${report.sensorReadings?.soilMoisture ?? "N/A"} %
                </strong>
            </div>

        </div>
    </div>


    <div class="card">
        <h2>❓ Why is this happening?</h2>

        <p>
            ${report.whyItHappens || "No explanation available."}
        </p>
    </div>


    <div class="card">
        <h2>📈 Expected Spread</h2>

        <p>
            ${report.expectedSpread || "No spread information available."}
        </p>
    </div>


    <div class="card">
        <h2>💡 Recommended Solution</h2>

        <p>
            ${report.solution || "No solution available."}
        </p>
    </div>


    <div class="card">
        <h2>🛡️ Prevention</h2>

        <ul>
            ${preventionList}
        </ul>
    </div>


    <div class="footer">
        Generated by Crop Health System
    </div>

</div>

</body>
</html>
        `);

    } catch (error) {
        console.error("Disease Report Page Error:", error);

        return res.status(404).send(`
            <h2>Disease report not found</h2>
            <p>${error.message}</p>
        `);
    }
};


module.exports = {
    analyzeDisease,
    getReportById,
    getReportPage
};