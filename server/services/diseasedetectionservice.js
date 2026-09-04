const DiseaseReport = require("../models/diseasereport");
const QRCode = require("qrcode");

class DiseaseDetectionService {
  async analyzeCrop({ farmerId, farmId, crop, imagePath, sensorReadings }) {
    const prediction = await this.getPrediction(crop, imagePath);

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

    // Public URL that the QR code will contain.
    const reportUrl = `${process.env.PUBLIC_REPORT_BASE_URL}/api/disease/report-page/${report._id}`;

    // Generate QR code as a Data URL.
    const qrCode = await QRCode.toDataURL(reportUrl);

    // Save QR code into the report.
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

  getDemoPrediction(crop) {
    const predictions = {
      Tomato: {
        disease: "Early Blight",
        confidence: 91,
        riskLevel: "High",

        whyItHappens:
          "The disease can develop under favorable environmental conditions and prolonged leaf wetness.",

        expectedSpread:
          "The disease may spread to nearby plants when favorable conditions continue.",

        solution:
          "Remove severely affected plant material where practical and maintain good field hygiene.",

        prevention: [
          "Avoid prolonged leaf wetness where possible.",
          "Maintain adequate spacing and airflow.",
          "Monitor nearby plants regularly.",
          "Use locally approved crop-management guidance.",
        ],
      },

      Potato: {
        disease: "Early Blight",
        confidence: 88,
        riskLevel: "Medium",

        whyItHappens: "Warm, humid conditions can favor disease development.",

        expectedSpread: "Spread can increase when favorable weather persists.",

        solution:
          "Remove severely affected material and monitor the crop regularly.",

        prevention: [
          "Maintain good field hygiene.",
          "Avoid unnecessary prolonged leaf wetness.",
          "Monitor plants regularly.",
        ],
      },

      Wheat: {
        disease: "Leaf Rust",
        confidence: 90,
        riskLevel: "High",

        whyItHappens:
          "Suitable temperature and moisture conditions can favor fungal disease development.",

        expectedSpread:
          "The disease can spread through the crop when favorable conditions persist.",

        solution:
          "Monitor affected areas closely and seek local agricultural guidance.",

        prevention: [
          "Inspect the crop regularly.",
          "Maintain appropriate crop management.",
          "Follow locally recommended disease-management practices.",
        ],
      },
    };

    return (
      predictions[crop] || {
        disease: "Possible Crop Disease",
        confidence: 75,
        riskLevel: "Medium",

        whyItHappens:
          "Environmental conditions and crop-specific factors may contribute to disease development.",

        expectedSpread:
          "Spread depends on crop, weather, and field conditions.",

        solution:
          "Inspect affected plants and seek expert confirmation when needed.",

        prevention: [
          "Monitor the crop regularly.",
          "Maintain field hygiene.",
          "Follow locally approved crop-management guidance.",
        ],
      }
    );
  }

  async getPrediction(crop, imagePath) {
    // Temporary prediction layer.
    // The real ML API will be connected here later.
    return this.getDemoPrediction(crop);
  }
}

module.exports = new DiseaseDetectionService();
