const Device = require("../models/device");
const Farm = require("../models/farm");

class DeviceService {

    async registerDevice(deviceData, farmerId) {

        const {
            deviceId,
            name,
            farmId
        } = deviceData;

        const farm = await Farm.findOne({
            _id: farmId,
            farmerId
        });

        if (!farm) {
            throw new Error("Farm not found or you do not have access to this farm");
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

    async getDevice(deviceId, farmerId) {

        const device = await Device.findOne({ deviceId });

        if (!device) {
            throw new Error("Device not found");
        }

        const farm = await Farm.findOne({
            _id: device.farmId,
            farmerId
        });

        if (!farm) {
            throw new Error("You do not have access to this device");
        }

        return device;
    }
}

module.exports = new DeviceService();