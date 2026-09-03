const DiseaseReport = require("../models/diseasereport");

class DiseaseDetectionService {
    async analyzeCrop({
        farmerId,
        farmId,
        crop,
        imagePath,
        sensorReadings
    }) {
        // Temporary demo result.
        // Replace this section later with a real AI model.
        const prediction = this.getDemoPrediction(crop);

        const report = await DiseaseReport.create({
            farmerId,
            farmId,
            crop,
            image: imagePath,

            disease: prediction.disease,
            confidence: prediction.confidence,
            riskLevel: prediction.riskLevel,

            whyItHappens: prediction.whyItHappens,
            expectedSpread: prediction.expectedSpread,
            solution: prediction.solution,
            prevention: prediction.prevention,

            sensorReadings
        });

        return report;
    }

    getDemoPrediction(crop) {
        const predictions = {
            Tomato: {
                disease: "Early Blight",
                confidence: 91,
                riskLevel: "High",
                whyItHappens:
                    "The disease can develop under favorable environmental conditions and prolonged leaf wetness.",
                expectedSpread:
                    "The disease may spread to nearby plants when favorable conditions continue.",
                solution:
                    "Remove severely affected plant material where practical and maintain good field hygiene.",
                prevention: [
                    "Avoid prolonged leaf wetness where possible.",
                    "Maintain adequate spacing and airflow.",
                    "Monitor nearby plants regularly.",
                    "Use locally approved crop-management guidance."
                ]
            },

            Potato: {
                disease: "Early Blight",
                confidence: 88,
                riskLevel: "Medium",
                whyItHappens:
                    "Warm, humid conditions can favor disease development.",
                expectedSpread:
                    "Spread can increase when favorable weather persists.",
                solution:
                    "Remove severely affected material and monitor the crop regularly.",
                prevention: [
                    "Maintain good field hygiene.",
                    "Avoid unnecessary prolonged leaf wetness.",
                    "Monitor plants regularly."
                ]
            },

            Wheat: {
                disease: "Leaf Rust",
                confidence: 90,
                riskLevel: "High",
                whyItHappens:
                    "Suitable temperature and moisture conditions can favor fungal disease development.",
                expectedSpread:
                    "The disease can spread through the crop when favorable conditions persist.",
                solution:
                    "Monitor affected areas closely and seek local agricultural guidance.",
                prevention: [
                    "Inspect the crop regularly.",
                    "Maintain appropriate crop management.",
                    "Follow locally recommended disease-management practices."
                ]
            }
        };

        return (
            predictions[crop] || {
                disease: "Possible Crop Disease",
                confidence: 75,
                riskLevel: "Medium",
                whyItHappens:
                    "Environmental conditions and crop-specific factors may contribute to disease development.",
                expectedSpread:
                    "Spread depends on crop, weather, and field conditions.",
                solution:
                    "Inspect affected plants and seek expert confirmation when needed.",
                prevention: [
                    "Monitor the crop regularly.",
                    "Maintain field hygiene.",
                    "Follow locally approved crop-management guidance."
                ]
            }
        );
    }
}

module.exports = new DiseaseDetectionService();