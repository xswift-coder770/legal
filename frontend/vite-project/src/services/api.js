import axios from "axios";

const rawBase = import.meta.env.VITE_API_URL || "http://localhost:5000";
const cleanBase = rawBase.replace(/\/+$/, "");

const API = axios.create({
    baseURL: `${cleanBase}/api`,
    headers: {
        "Content-Type": "application/json",
    },
});

// ============================================
// Request Interceptor — Attach JWT Token
// ============================================

API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token");

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        return config;
    },
    (error) => Promise.reject(error)
);

// ============================================
// Response Interceptor — Handle 401 Globally
// ============================================

API.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            // Token expired or invalid — clear storage and redirect
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

// ============================================
// Auth API
// ============================================

export const registerUser = async (name, email, password) => {
    const response = await API.post("/auth/register", { name, email, password });
    return response.data;
};

export const loginUser = async (email, password) => {
    const response = await API.post("/auth/login", { email, password });
    return response.data;
};

export const getMe = async () => {
    const response = await API.get("/auth/me");
    return response.data;
};

// ============================================
// Upload PDF
// ============================================

export const uploadPDF = async (file) => {
    const formData = new FormData();

    formData.append("file", file);

    const response = await API.post("/upload/pdf", formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });

    return response.data;
};

// ============================================
// Chat with Uploaded Document
// ============================================

export const askQuestion = async (question, docId) => {
    const response = await API.post("/chat", {
        question,
        docId,         // Required — scopes search to this document
    });

    return response.data;
};

// ============================================
// History
// ============================================

export const getHistory = async () => {
    const response = await API.get("/history");
    return response.data;
};

export const deleteAnalysis = async (id) => {
    const response = await API.delete(`/history/${id}`);
    return response.data;
};

export default API;