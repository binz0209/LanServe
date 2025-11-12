import axios from "axios";

// Detect production: check if not localhost
const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (isProduction ? "/api" : "https://lanserve-api-cgfghcd9bshbazbd.malaysiawest-01.azurewebsites.net/api"),
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      config.headers = config.headers || {};
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (res) => res,
  (err) => {
    // tránh app crash khi API fail
    console.error("API error:", err?.response || err.message);
    return Promise.reject(err);
  }
);

export default api;
