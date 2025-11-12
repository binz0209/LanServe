import { create } from "zustand";
import * as signalR from "@microsoft/signalr";
import { api } from "../lib/api";

// Detect production: check if not localhost
const isProduction = typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
// SignalR cần kết nối trực tiếp đến backend Azure (không qua Vercel proxy vì WebSocket không được proxy)
const API_BASE = import.meta.env.VITE_API_BASE 
  ? import.meta.env.VITE_API_BASE.replace(/\/api\/?$/, "")
  : isProduction
    ? "https://lanserve-api-cgfghcd9bshbazbd.malaysiawest-01.azurewebsites.net"
    : "http://localhost:5070";

export const useNotificationStore = create((set, get) => ({
  items: [],
  connection: null,
  connected: false,

  // 🟢 Thêm thông báo (tránh trùng ID)
  addNotification: (notif) => {
    console.log("➕ Adding notification:", notif);
    return set((s) => {
      if (!notif || !notif.id) {
        console.warn("⚠️ Invalid notification (missing id):", notif);
        return s;
      }
      if (s.items.some((n) => n.id === notif.id)) {
        console.log("⚠️ Notification already exists:", notif.id);
        return s;
      }
      const newItems = [notif, ...s.items];
      console.log(`✅ Notification added. Total: ${newItems.length}`);
      return { items: newItems };
    });
  },

  markRead: (id) =>
    set((s) => ({
      items: s.items.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    })),

  // 🧠 Load lại thông báo cũ từ DB
  fetchFromServer: async () => {
    try {
      const res = await api.get("/api/notifications/my"); // ✅ chuẩn với BE
      const data = res.data || [];

      const parsed = data.map((n) => {
        try {
          if (n.payload && typeof n.payload === "string") {
            n.payloadObj = JSON.parse(n.payload);
          }
        } catch (err) {
          console.warn("⚠️ Parse payload error:", err);
        }
        return n;
      });

      console.log(`📥 Loaded ${parsed.length} notifications from DB`);
      set({ items: parsed });
    } catch (err) {
      console.error("❌ Failed to load notifications:", err);
    }
  },

  // 🔗 Kết nối SignalR
  initConnection: async () => {
    try {
      const token =
        localStorage.getItem("token") ||
        sessionStorage.getItem("token") ||
        localStorage.getItem("accessToken");

      if (!token) {
        console.warn("⚠️ No token found, cannot connect SignalR");
        return;
      }

      // Dừng connection cũ nếu có
      const old = get().connection;
      if (old) {
        try {
          await old.stop();
        } catch {}
      }

      console.log("🔗 Connecting to SignalR NotificationHub...");

      const connection = new signalR.HubConnectionBuilder()
        .withUrl(`${API_BASE}/hubs/notification`, {
          accessTokenFactory: () => token,
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Khi nhận thông báo realtime
      connection.on("ReceiveNotification", (notif) => {
        console.log("📩 [SignalR] Notification received:", notif);
        try {
          if (notif?.payload && typeof notif.payload === "string") {
            notif.payloadObj = JSON.parse(notif.payload);
          }
        } catch (err) {
          console.warn("⚠️ Cannot parse payload:", err);
        }
        const added = get().addNotification(notif);
        console.log("✅ Notification added to store:", notif.type, notif.id);
      });

      await connection.start();
      console.log("✅ Connected to SignalR hub");

      set({ connection, connected: true });
    } catch (err) {
      console.error("❌ Error connecting SignalR:", err);
      set({ connected: false });
    }
  },

  // 🧹 Reset store khi logout hoặc login user mới
  reset: async () => {
    try {
      const old = get().connection;
      if (old) {
        await old.stop();
        console.log("🔌 SignalR connection stopped");
      }
    } catch (err) {
      console.warn("⚠️ Error stopping connection:", err);
    }

    set({ items: [], connection: null, connected: false });
    console.log("🧹 Notification store reset done");
  },
}));
