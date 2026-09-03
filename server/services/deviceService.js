const Device = require("../models/device");

class DeviceService {

    async registerDevice(deviceData) {

        const {
            deviceId,
            name
        } = deviceData;

        const existingDevice = await Device.findOne({ deviceId });

        if (existingDevice) {
            throw new Error("Device with this deviceId already exists");
        }

        const device = await Device.create({
            deviceId,
            name
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