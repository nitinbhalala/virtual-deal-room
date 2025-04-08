// utils/api.ts
import axios from "axios";

const api = axios.create({
    baseURL: 'http://192.168.29.174:4000/api/', // 🔁 Replace with your backend URL
});

// OPTIONAL: If token is needed for protected routes
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

export default api;
