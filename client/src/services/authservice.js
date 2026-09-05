import api from "./api";

class AuthService {

    async register(userData) {
        const response =
            await api.post("/auth/register", userData);

        return response.data;
    }
async login(data) {
    try {
        const response = await api.post("/auth/login", {
            mobile: data.mobile,
            password: data.password
        });

        console.log("LOGIN RESPONSE:", response);

        if (!response.data || !response.data.token) {
            throw new Error(
                response.data?.message ||
                "Login response does not contain a token"
            );
        }

        localStorage.setItem("token", response.data.token);

        return response.data;

    } catch (error) {
        console.error(
            "LOGIN ERROR:",
            error.response?.data || error.message
        );

        throw error;
    }
}

    async sendOTP(mobile) {
        const response =
            await api.post("/auth/send-otp", {
                mobile
            });

        return response.data;
    }

    async verifyOTP(mobile, otp) {
        const response =
            await api.post("/auth/verify-otp", {
                mobile,
                otp
            });

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