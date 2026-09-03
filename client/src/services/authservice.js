import api from "./api";

class AuthService {
    async register(userData) {
        const response = await api.post("/auth/register", userData);
        return response.data;
    }

    async login(userData) {
        const response = await api.post("/auth/login", userData);

        if (response.data.token) {
            localStorage.setItem("token", response.data.token);
        }

        return response.data;
    }

    logout() {
        localStorage.removeItem("token");
    }

    getToken() {
        return localStorage.getItem("token");
    }
}

export default new AuthService();