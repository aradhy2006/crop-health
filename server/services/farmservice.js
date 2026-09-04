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

    async updateFarm(farmId, farmData, farmerId) {
        const farm = await Farm.findOneAndUpdate(
            {
                _id: farmId,
                farmerId
            },
            {
                $set: farmData
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!farm) {
            throw new Error("Farm not found");
        }

        return farm;
    }
}

module.exports = new FarmService();