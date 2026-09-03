const Device = require("../models/device");
const Farm = require("../models/farm");

class DeviceService {

    async registerDevice(deviceData) {

        const {
            deviceId,
            name,
            farmId
        } = deviceData;

        const farm = await Farm.findById(farmId);

        if (!farm) {
            throw new Error("Farm not found");
        }

        const existingDevice = await Device.findOne({ deviceId });

        if (existingDevice) {
            throw new Error("Device with this deviceId already exists");
        }

        const device = await Device.create({
            deviceId,
            name,
            farmId
        });

        return device;
    }

    async getDevice(deviceId) {

        const device = await Device.findOne({ deviceId });

        if (!device) {
            throw new Error("Device not found");
        }

        return device;
    }
}

module.exports = new DeviceService();