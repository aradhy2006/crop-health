const deviceService = require("../services/deviceService");

const registerDevice = async (req, res) => {
    try {
        const {
            deviceId,
            name
        } = req.body;

        if (!deviceId) {
            return res.status(400).json({
                success: false,
                message: "deviceId is required"
            });
        }

        const device = await deviceService.registerDevice({
            deviceId,
            name
        });

        return res.status(201).json({
            success: true,
            message: "Device registered successfully",
            device
        });

    } catch (error) {

        console.error("Device Registration Error:", error.message);

        return res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getDevice = async (req, res) => {
    try {
        const { deviceId } = req.params;

        const device = await deviceService.getDevice(deviceId);

        return res.status(200).json({
            success: true,
            device
        });

    } catch (error) {

        console.error("Get Device Error:", error.message);

        return res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    registerDevice,
    getDevice
};