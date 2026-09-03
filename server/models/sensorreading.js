const mongoose = require("mongoose");

const sensorReadingSchema = new mongoose.Schema(
    {
        deviceId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Device",
            required: true
        },

        temperature: {
            type: Number,
            required: true
        },

        humidity: {
            type: Number,
            required: true
        },

        soilMoisture: {
            type: Number,
            required: true
        },

        recordedAt: {
            type: Date,
            default: Date.now
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("SensorReading", sensorReadingSchema);