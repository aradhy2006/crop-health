import api from "./api";

class DiseaseService {
  async analyzeDisease(formData) {
    const token = localStorage.getItem("token");

    const response = await api.post("/disease/analyze", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data;
  }

  async getReports() {
    const token = localStorage.getItem("token");

    const response = await api.get("/disease/reports", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }

  async getReportById(reportId) {
    const token = localStorage.getItem("token");

    const response = await api.get(`/disease/reports/${reportId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  }
}

export default new DiseaseService();
