const mongoose = require("mongoose");
const DiseaseReport = require("../models/diseasereport");
const Farm = require("../models/farm");
const QRCode = require("qrcode");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");

class DiseaseDetectionService {
    async analyzeCrop({
        farmerId,
        farmId,
        crop,
        imagePath,
        imageUrl,
        sensorReadings,
    }) {
        const prediction = await this.getPrediction(
            crop,
            imagePath,
            sensorReadings
        );

        const reportId = new mongoose.Types.ObjectId();
        const baseUrl = process.env.PUBLIC_REPORT_BASE_URL || "";
        const reportUrl = `${baseUrl}/api/disease/report-page/${reportId}`;

        let qrCode = "";
        try {
            qrCode = await QRCode.toDataURL(reportUrl);
        } catch (qrErr) {
            console.warn("QR code generation warning:", qrErr.message);
        }

        const report = await DiseaseReport.create({
            _id: reportId,
            farmerId,
            farmId,
            crop,
            image: imageUrl || imagePath,

            disease: prediction.disease,
            confidence: prediction.confidence,
            riskLevel: prediction.riskLevel,

            whyItHappens: prediction.whyItHappens,
            expectedSpread: prediction.expectedSpread,
            solution: prediction.solution,
            prevention: prediction.prevention,

            sensorReadings,
            qrCode,
        });

        return report;
    }

    async getMyReports(farmerId) {
        const reports = await DiseaseReport.find({
            farmerId,
        }).sort({
            createdAt: -1,
        });

        return reports;
    }

    async getReportById(reportId) {
        const report = await DiseaseReport.findById(reportId)
            .populate("farmId");

        if (!report) {
            throw new Error("Disease report not found");
        }

        return report;
    }

    async getPrediction(crop, imagePath, sensorReadings) {
        const form = new FormData();

        form.append(
            "file",
            fs.createReadStream(imagePath)
        );

        form.append("crop", crop);

        form.append(
            "temperature",
            String(sensorReadings?.temperature ?? 0)
        );

        form.append(
            "humidity",
            String(sensorReadings?.humidity ?? 0)
        );

        form.append(
            "soil_moisture",
            String(
                sensorReadings?.soilMoisture ??
                sensorReadings?.soil_moisture ??
                0
            )
        );

        let response;

        try {
            console.log(
    "ML API URL:",
    `${process.env.ML_API_BASE_URL}/prediction/predict`
);
          response = await axios.post(
    `${process.env.ML_API_BASE_URL}/prediction/predict`,
    form,
    { headers: form.getHeaders(), maxContentLength: Infinity, maxBodyLength: Infinity, timeout: 100000 }
);
        } catch (error) {
    console.error("ML API STATUS:", error.response?.status);
    console.error("ML API DATA:", error.response?.data);
    console.error("ML API MESSAGE:", error.message);
    console.error("ML API CODE:", error.code);

    throw new Error(
        error.response?.data?.detail ||
        error.response?.data?.error ||
        error.response?.data?.message ||
        "Disease detection service is unavailable"
    );
}

        console.log(
            "ML RESPONSE:",
            JSON.stringify(response.data, null, 2)
        );

        if (response.data?.error) {
            throw new Error(response.data.error);
        }

        if (!response.data?.disease) {
            throw new Error(
                "Disease detection failed: no disease prediction returned"
            );
        }

        const confidence =
            Number(response.data.confidence) * 100;

        if (Number.isNaN(confidence)) {
            throw new Error(
                "Disease detection failed: invalid confidence returned"
            );
        }

        const risk = String(response.data.risk || "")
            .toLowerCase()
            .replace(/^./, (char) => char.toUpperCase());

        if (!["Low", "Medium", "High"].includes(risk)) {
            throw new Error(
                "Disease detection failed: invalid risk level returned"
            );
        }

        const solution =
            Array.isArray(response.data.solutions)
                ? response.data.solutions.join(" ")
                : String(response.data.solutions || "");

        const prevention =
            Array.isArray(response.data.preventiveMeasures)
                ? response.data.preventiveMeasures
                : [];

        return {
            disease: response.data.disease,

            confidence,

            riskLevel: risk,

            whyItHappens:
                response.data.why || "",

            expectedSpread:
                response.data.spreadRisk || "",

            solution,

            prevention,
        };
    }
}

module.exports = new DiseaseDetectionService();