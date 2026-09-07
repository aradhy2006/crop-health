const SensorReading = require("../models/sensorreading");
const Device = require("../models/device");
const Farm = require("../models/farm");

const ONLINE_WINDOW_MS = 5 * 60 * 1000;

const withLiveStatus = (device) => {
    if (!device) {
        return null;
    }

    const plain = device.toObject ? device.toObject() : device;
    const lastSeenTime = plain.lastSeen
        ? new Date(plain.lastSeen).getTime()
        : 0;
    const isOnline =
        Number.isFinite(lastSeenTime) &&
        Date.now() - lastSeenTime < ONLINE_WINDOW_MS;

    return {
        ...plain,
        status: isOnline ? "online" : "offline"
    };
};

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

        let device = await Device.findOne({ deviceId });

        if (!device) {
            const farm = await Farm.findOne().sort({
                createdAt: 1
            });

            if (!farm) {
                throw new Error(
                    "Device not found. Add a farm first, then send sensor data."
                );
            }

            device = await Device.create({
                deviceId,
                name: "ESP32 Device",
                farmId: farm._id,
                status: "online",
                lastSeen: new Date()
            });
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

        let device = await Device.findOne({
            farmId: farm._id
        }).sort({
            lastSeen: -1,
            updatedAt: -1
        });

        if (!device) {
            device = await Device.findOne({
                deviceId: "ESP32-003"
            });
        }

        if (!device) {
            device = await Device.findOne().sort({
                lastSeen: -1,
                updatedAt: -1
            });
        }

        if (!device) {
            device = await Device.create({
                deviceId: "ESP32-003",
                name: "ESP32 Device",
                farmId: farm._id,
                status: "offline"
            });
        } else if (
            !device.farmId ||
            device.farmId.toString() !== farm._id.toString()
        ) {
            device.farmId = farm._id;
            await device.save();
        }

        return withLiveStatus(device);
    }
}

module.exports = new SensorService();