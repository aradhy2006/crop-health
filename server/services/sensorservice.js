const SensorReading = require("../models/sensorreading");
const Device = require("../models/device");

class SensorService {

    async createSensorReading(sensorData) {

        const {
            deviceId,
            temperature,
            humidity,
            soilMoisture
        } = sensorData;

        const device = await Device.findOne({ deviceId });

        if (!device) {
            throw new Error("Device not found");
        }

        const reading = await SensorReading.create({
            deviceId: device._id,
            temperature,
            humidity,
            soilMoisture
        });

        device.lastSeen = new Date();
        device.status = "online";

        await device.save();

        return reading;
    }
}

module.exports = new SensorService();