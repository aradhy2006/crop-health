import api from "./api";

class SensorService {
    async getLatestReading(deviceId) {
        const token = localStorage.getItem("token");

        const response = await api.get(
            `/sensors/readings/${deviceId}/latest`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;
    }
}

export default new SensorService(); 