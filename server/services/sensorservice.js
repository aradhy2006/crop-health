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

    async getSensorReadings(deviceId) {

        const device = await Device.findOne({ deviceId });

        if (!device) {
            throw new Error("Device not found");
        }

        const readings = await SensorReading.find({
            deviceId: device._id
        }).sort({
            recordedAt: -1
        });

        return readings;
    }

    async getLatestSensorReading(deviceId) {

        const device = await Device.findOne({ deviceId });

        if (!device) {
            throw new Error("Device not found");
        }

        const reading = await SensorReading.findOne({
            deviceId: device._id
        }).sort({
            recordedAt: -1
        });

        if (!reading) {
            throw new Error("No sensor readings found for this device");
        }

        return reading;
    }
}

module.exports = new SensorService();