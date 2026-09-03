const farmService = require("../services/farmservice");

const createFarm = async (req, res) => {
    try {
        const farm = await farmService.createFarm(
            req.body,
            req.user.userId
        );

        res.status(201).json({
            success: true,
            message: "Farm created successfully",
            farm
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

const getMyFarms = async (req, res) => {
    try {
        const farms = await farmService.getMyFarms(req.user.userId);

        res.status(200).json({
            success: true,
            farms
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

module.exports = {
    createFarm,
    getMyFarms
};