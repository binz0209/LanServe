import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5070/api",
  headers: { "Content-Type": "application/json" },
});

// Gắn token cho mọi request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
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

export default api;
