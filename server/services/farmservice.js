const Farm = require("../models/farm");

class FarmService {
    async createFarm(farmData, farmerId) {
        const farm = await Farm.create({
            ...farmData,
            farmerId
        });

        return farm;
    }

    async getMyFarms(farmerId) {
        return await Farm.find({ farmerId }).sort({ createdAt: -1 });
    }
}

module.exports = new FarmService();