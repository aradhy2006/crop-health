const mongoose = require("mongoose");

const farmSchema = new mongoose.Schema(
    {
        farmerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        farmName: {
            type: String,
            required: true,
            trim: true
        },

        location: {
            type: String,
            required: true,
            trim: true
        },

        crop: {
            type: String,
            required: true,
            trim: true
        },

        cropVariety: {
            type: String,
            trim: true
        },

        cropStage: {
            type: String,
            required: true,
            trim: true
        },

        soilType: {
            type: String,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

farmSchema.index({ farmerId: 1 });

module.exports = mongoose.model("Farm", farmSchema);