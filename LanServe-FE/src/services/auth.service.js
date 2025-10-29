import { api } from "../lib/axios";

export const AuthService = {
  async login({ email, password }) {
    const { data } = await api.post("/api/auth/login", { email, password });
    // Linh hoạt tên field từ BE: accessToken | token
    const accessToken = data?.accessToken || data?.token;
    const user = data?.user || data?.data?.user || null;
    return { accessToken, user, raw: data };
  },
};
