const DiseaseReport = require("../models/diseasereport");
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
        sensorReadings,
    }) {
        const prediction = await this.getPrediction(
            crop,
            imagePath,
            sensorReadings
        );

        const report = await DiseaseReport.create({
            farmerId,
            farmId,
            crop, 
            image: imagePath,

            disease: prediction.disease,
            confidence: prediction.confidence,
            riskLevel: prediction.riskLevel,

            whyItHappens: prediction.whyItHappens,
            expectedSpread: prediction.expectedSpread,
            solution: prediction.solution,
            prevention: prediction.prevention,

            sensorReadings,
        });

        const reportUrl =
            `${process.env.PUBLIC_REPORT_BASE_URL}` +
            `/api/disease/report-page/${report._id}`;

        const qrCode = await QRCode.toDataURL(reportUrl);

        report.qrCode = qrCode;

        await report.save();

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
        const report = await DiseaseReport.findById(reportId);

        if (!report) {
            throw new Error("Disease report not found");
        }

        return report;
    }

  async getPrediction(crop, imagePath) {
    const form = new FormData();

    form.append(
        "file",
        fs.createReadStream(imagePath)
    );

    form.append("crop", crop);

    const response = await axios.post(
        "http://10.50.170.223:8000/prediction/predict",
        form,
        {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
        }
    );

    const risk =
        String(response.data.risk || "")
            .toLowerCase()
            .replace(/^./, (char) =>
                char.toUpperCase()
            );

    const solution = Array.isArray(response.data.solutions)
        ? response.data.solutions.join(" ")
        : String(response.data.solutions || "");

    const prevention = Array.isArray(
        response.data.preventiveMeasures
    )
        ? response.data.preventiveMeasures
        : [];

    return {
        disease: response.data.disease,

        confidence: Number(
            response.data.confidence*100
        ),

        riskLevel: risk,

        whyItHappens:
            response.data.why,

        expectedSpread:
            response.data.spreadRisk,

        solution: solution,

        prevention: prevention,
    };
}}

module.exports = new DiseaseDetectionService();