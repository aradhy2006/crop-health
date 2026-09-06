const SensorReading = require("../models/sensorreading");
const Device = require("../models/device");
const Farm = require("../models/farm");

class SensorService {

    // =====================================================
    // ESP32 SENDS SENSOR DATA
    // =====================================================
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

    // =====================================================
    // GET ALL SENSOR READINGS
    // =====================================================
    async getSensorReadings(deviceId, farmerId) {
        const device = await Device.findOne({ deviceId });

        if (!device) {
            throw new Error("Device not found");
        }

        const farm = await Farm.findOne({
            _id: device.farmId,
            farmerId
        });

        if (!farm) {
            throw new Error(
                "You do not have access to this device"
            );
        }

        const readings = await SensorReading.find({
            deviceId: device._id
        }).sort({
            recordedAt: -1
        });

        return readings;
    }

    // =====================================================
    // GET LATEST SENSOR READING
    // =====================================================
    async getLatestSensorReading(deviceId, farmerId) {
        const device = await Device.findOne({ deviceId });

        if (!device) {
            throw new Error("Device not found");
        }

        const farm = await Farm.findOne({
            _id: device.farmId,
            farmerId
        });

        if (!farm) {
            throw new Error(
                "You do not have access to this device"
            );
        }

        const reading = await SensorReading.findOne({
            deviceId: device._id
        }).sort({
            recordedAt: -1
        });

        if (!reading) {
            throw new Error(
                "No sensor readings found for this device"
            );
        }

        return reading;
    }

    // =====================================================
    // AUTOMATICALLY ASSIGN ESP32-003 TO CURRENT FARMER
    // =====================================================
    async getMyDevice(farmerId) {

        // Find a farm belonging to the logged-in farmer
        const farm = await Farm.findOne({
            farmerId
        }).sort({
            createdAt: 1
        });

        // Farmer has no farm
        if (!farm) {
            return null;
        }

        // Find the one physical ESP32
        const device = await Device.findOne({
            deviceId: "ESP32-003"
        });

        // Device doesn't exist
        if (!device) {
            return null;
        }

        // Automatically assign ESP32-003
        // to the current farmer's farm
        if (
            !device.farmId ||
            device.farmId.toString() !== farm._id.toString()
        ) {
            device.farmId = farm._id;
            device.status = "online";

            await device.save();
        }

        return device;
    }
}

module.exports = new SensorService();