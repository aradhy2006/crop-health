import api from "./api";

class DiseaseService {
    async analyzeDisease(formData) {
        const token = localStorage.getItem("token");

        const response = await api.post(
            "/disease/analyze",
            formData,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "multipart/form-data"
                }
            }
        );

        return response.data;
    }
}

export default new DiseaseService();