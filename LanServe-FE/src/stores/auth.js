import { create } from "zustand";

const persisted = (key, initial) => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : initial;
};

export const useAuthStore = create((set, get) => ({
  token: persisted("lanserve_token", null),
  user: persisted("lanserve_user", null),

  login: ({ token, user }) => {
    localStorage.setItem("lanserve_token", JSON.stringify(token));
    localStorage.setItem("lanserve_user", JSON.stringify(user || null));
    set({ token, user: user || null });
  },

  logout: () => {
    localStorage.removeItem("lanserve_token");
    localStorage.removeItem("lanserve_user");
    set({ token: null, user: null });
  },

  setUser: (user) => {
    localStorage.setItem("lanserve_user", JSON.stringify(user || null));
    set({ user: user || null });
  },
}));
