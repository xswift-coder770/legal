import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL + "/api",
    headers: {
        "Content-Type": "application/json",
    },
});

// =============================
// Upload PDF
// =============================
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

// =============================
// Chat with Uploaded Document
// =============================
export const askQuestion = async (question) => {
    const response = await API.post("/chat", {
        question,
    });

    return response.data;
};

export default API;