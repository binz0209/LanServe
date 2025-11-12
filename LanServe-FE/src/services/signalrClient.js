import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";

let connection;

export const notificationHub = {
  on: (...args) => connection?.on(...args),
  off: (...args) => connection?.off(...args),
  invoke: (...args) => connection?.invoke(...args),
};

export async function startNotificationHub() {
  if (connection && connection.state !== "Disconnected") {
    console.warn("⚠️ SignalR already started.");
    return;
  }

  // Detect production: check if not localhost
  const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
  // SignalR cần kết nối trực tiếp đến backend Azure (không qua Vercel proxy vì WebSocket không được proxy)
  const baseUrl = import.meta.env.VITE_API_URL 
    ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
    : isProduction
      ? "https://lanserve-api-cgfghcd9bshbazbd.malaysiawest-01.azurewebsites.net"
      : "http://localhost:5070";

  // ✅ Lấy token chuẩn
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  connection = new HubConnectionBuilder()
    .withUrl(`${baseUrl}/hubs/notification`, {
      accessTokenFactory: () => token, // ✅ đảm bảo có token mỗi lần connect
    })
    .configureLogging(LogLevel.Information)
    .withAutomaticReconnect()
    .build();

  try {
    await connection.start();
    console.log("✅ SignalR connected to:", `${baseUrl}/hubs/notification`);
  } catch (err) {
    console.error("❌ SignalR connect error:", err);
  }
}
