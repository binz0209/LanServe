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

  const baseUrl = (
    import.meta.env.VITE_API_URL || "http://localhost:5070/api"
  ).replace(/\/api\/?$/, "");

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
