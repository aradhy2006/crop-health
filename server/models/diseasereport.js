const mongoose = require("mongoose");

const diseaseReportSchema = new mongoose.Schema(
    {
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        farmId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Farm",
            required: true
        },

        crop: {
            type: String,
            required: true
        },

        image: {
            type: String,
            required: true
        },

        // AI diagnosis
        disease: {
            type: String,
            required: true
        },
        confidence: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },

        riskLevel: {
            type: String,
            enum: ["Low", "Medium", "High", "Critical"],
            default: "Medium"
        },

        // Explanation
        whyItHappens: {
            type: String,
            default: ""
        },

        expectedSpread: {
            type: String,
            default: ""
        },

        // Management
        solution: {
            type: String,
            default: ""
        },

        prevention: {
            type: [String],
            default: []
        },

        // Sensor data at the time of diagnosis
        sensorReadings: {
            temperature: {
                type: Number
            },

            humidity: {
                type: Number
            },

            soilMoisture: {
                type: Number
            },
        },

        // QR code for report
        qrCode: {
            type: String,
            default: ""
        },

        // Future tracking
        status: {
            type: String,
            enum: ["Generated", "Under Review", "Confirmed"],
            default: "Generated"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("DiseaseReport", diseaseReportSchema);