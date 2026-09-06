const sensorService = require("../services/sensorservice");

const createSensorReading = async (req, res) => {
    try {
        const {
            deviceId,
            temperature,
            humidity,
            soilMoisture
        } = req.body;

        if (
            !deviceId ||
            temperature === undefined ||
            humidity === undefined ||
            soilMoisture === undefined
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "deviceId, temperature, humidity and soilMoisture are required"
            });
        }

        if (
            typeof temperature !== "number" ||
            typeof humidity !== "number" ||
            typeof soilMoisture !== "number"
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Temperature, humidity and soilMoisture must be numbers"
            });
        }

        if (humidity < 0 || humidity > 100) {
            return res.status(400).json({
                success: false,
                message: "Humidity must be between 0 and 100"
            });
        }

        if (soilMoisture < 0 || soilMoisture > 100) {
            return res.status(400).json({
                success: false,
                message:
                    "Soil moisture must be between 0 and 100"
            });
        }

        const reading =
            await sensorService.createSensorReading(req.body);

        return res.status(201).json({
            success: true,
            message: "Sensor reading saved successfully",
            reading
        });

    } catch (error) {
        console.error(
            "Sensor Reading Error:",
            error.message
        );

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getSensorReadings = async (req, res) => {
    try {
        const { deviceId } = req.params;

        const readings =
            await sensorService.getSensorReadings(
                deviceId,
                req.user.userId
            );

        return res.status(200).json({
            success: true,
            readings
        });

    } catch (error) {
        console.error(
            "Get Sensor Readings Error:",
            error.message
        );

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

const getLatestSensorReading = async (req, res) => {
    try {
        const { deviceId } = req.params;

        const reading =
            await sensorService.getLatestSensorReading(
                deviceId,
                req.user.userId
            );

        return res.status(200).json({
            success: true,
            reading
        });

    } catch (error) {
        console.error(
            "Get Latest Sensor Reading Error:",
            error.message
        );

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

const getMyDevice = async (req, res) => {
    try {
        const device =
            await sensorService.getMyDevice(
                req.user.userId
            );

        return res.status(200).json({
            success: true,
            device: device || null
        });

    } catch (error) {
        console.error(
            "Get My Device Error:",
            error.message
        );

        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createSensorReading,
    getSensorReadings,
    getLatestSensorReading,
    getMyDevice
};