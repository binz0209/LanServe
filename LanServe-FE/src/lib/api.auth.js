// src/store/auth.js
import { create } from "zustand";
import { setAuthToken } from "../lib/axios";

const persisted = (key, initial) => {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initial;
  } catch {
    return initial;
  }
};

export const useAuthStore = create((set) => {
  const token = persisted("lanserve_token", null);
  const user = persisted("lanserve_user", null);

  // gắn token khi app load
  if (token) setAuthToken(token);

  return {
    token,
    user,

    // login({ token, user })
    login: ({ token, user }) => {
      localStorage.setItem("lanserve_token", JSON.stringify(token));
      localStorage.setItem("lanserve_user", JSON.stringify(user || null));
      setAuthToken(token);
      set({ token, user: user || null });
    },

    logout: () => {
      localStorage.removeItem("lanserve_token");
      localStorage.removeItem("lanserve_user");
      setAuthToken(null);
      set({ token: null, user: null });
    },

    setUser: (user) => {
      localStorage.setItem("lanserve_user", JSON.stringify(user || null));
      set({ user: user || null });
    },
  };
});
