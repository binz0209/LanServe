import axios from "axios";

// Detect production: check if not localhost
const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || (isProduction ? "/api" : "https://lanserve-api-cgfghcd9bshbazbd.malaysiawest-01.azurewebsites.net/api"),
  headers: { "Content-Type": "application/json" },
});

// Gắn token cho mọi request
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    console.log("➡️ Sending token:", token.slice(0, 15) + "...");
  }
  return config;
});

// Xử lý lỗi, KHÔNG auto redirect
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      console.warn("⚠️ 401 Unauthorized");
      // Tùy ý: hiển thị thông báo, hoặc logout thủ công
      // localStorage.removeItem("token");
      // window.location.replace("/login");
    }
    return Promise.reject(err);
  }
);

export { api };
export default api;
