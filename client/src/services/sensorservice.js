import api from "./api";

class SensorService {
    async getMyDevice() {
        const token = localStorage.getItem("token");

        const response = await api.get(
            "/sensors/my-device",
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        return response.data;
    }

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