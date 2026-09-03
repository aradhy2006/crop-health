const sensorService = require("../services/sensorservice");

const createSensorReading = async (req, res) => {
    try {
        const reading = await sensorService.createSensorReading(req.body);

        return res.status(201).json({
            success: true,
            message: "Sensor reading saved successfully",
            reading
        });

    } catch (error) {

        console.error("Sensor Reading Error:", error.message);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createSensorReading
};