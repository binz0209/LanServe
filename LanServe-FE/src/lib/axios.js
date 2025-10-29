import axios from "axios";

const api = axios.create({
  baseURL: "https://lanserve-api-cgfghcd9bshbazbd.malaysiawest-01.azurewebsites.net/api",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
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
