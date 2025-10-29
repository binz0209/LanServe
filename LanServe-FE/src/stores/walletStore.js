import { create } from "zustand";
import api from "../lib/api";

export const useWalletStore = create((set, get) => ({
  balance: 0,
  loading: false,
  error: null,

  txns: [],
  txLoading: false,
  txError: null,

  // ===== Lấy số dư ví =====
  fetchBalance: async (userId) => {
    if (!userId) return;
    set({ loading: true, error: null });
    try {
      const res = await api.get(`/api/wallets/${userId}`);
      const balance = res.data?.balance ?? 0;
      set({ balance, loading: false });
    } catch (e) {
      set({ error: e?.message || "Fetch balance failed", loading: false });
    }
  },

  // ===== Lấy toàn bộ lịch sử giao dịch (mọi type) =====
  fetchTransactions: async (userId, take = 20, sort = "desc") => {
    if (!userId) return;
    set({ txLoading: true, txError: null });
    try {
      const res = await api.get(`/api/wallets/history`, {
        params: { userId, take, sort },
      });
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.items || [];
      set({ txns: list, txLoading: false });
    } catch (e) {
      set({
        txError: e?.message || "Fetch transactions failed",
        txLoading: false,
      });
    }
  },

  // ===== Lấy lịch sử nạp tiền (TopUp) =====
  fetchTopups: async (userId, take = 20, sort = "desc") => {
    if (!userId) return;
    set({ txLoading: true, txError: null });
    try {
      const res = await api.get(`/api/wallets/topups`, {
        params: { userId, take, sort },
      });
      const list = Array.isArray(res.data)
        ? res.data
        : res.data?.items || [];
      set({ txns: list, txLoading: false });
    } catch (e) {
      set({
        txError: e?.message || "Fetch topup history failed",
        txLoading: false,
      });
    }
  },
}));
