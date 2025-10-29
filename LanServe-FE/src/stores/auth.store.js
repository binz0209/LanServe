import { create } from "zustand";
import { persist } from "zustand/middleware";
import jwtDecode from "jwt-decode";

export const useAuthStore = create(
  persist(
    (set, get) => ({
      accessToken: null,
      user: null,
      isAuthenticated: false,

      login: ({ accessToken, user }) => {
        set({ accessToken, user, isAuthenticated: !!accessToken });
      },

      logout: () => {
        set({ accessToken: null, user: null, isAuthenticated: false });
      },

      getTokenPayload: () => {
        const t = get().accessToken;
        if (!t) return null;
        try { return jwtDecode(t); } catch { return null; }
      },
    }),
    {
      name: "lanserve-auth",
      partialize: (s) => ({
        accessToken: s.accessToken,
        user: s.user,
        isAuthenticated: s.isAuthenticated,
      }),
    }
  )
);
