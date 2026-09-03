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

        // Safely capture user ID across different JWT payload structures
        const farmerId = req.user.userId || req.user._id || req.user.id;

        if (!farmerId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized: Farmer ID missing from request user"
            });
        }

        // Normalize image file path for cross-platform compatibility
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

module.exports = {
    analyzeDisease
};