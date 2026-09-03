import api from "./api";

class FarmService {
    async getMyFarms() {
        const token = localStorage.getItem("token");

        const response = await api.get("/farms", {
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data;
    }
}

export default new FarmService();