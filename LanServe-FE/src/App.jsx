import { useEffect } from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import NotificationBell from "./components/NotificationBell";
// 🔔 SignalR
import {
  notificationHub,
  startNotificationHub,
} from "./services/signalrClient";
import { useNotificationStore } from "./stores/notificationStore";

import Home from "./pages/Home";
import HowItWorks from "./pages/HowItWorks";
import NewProject from "./pages/NewProject";
import Projects from "./pages/account/Projects";
import AccountLayout from "./pages/account/AccountLayout";
import Profile from "./pages/account/Profile";
import Settings from "./pages/account/Settings";
import Messages from "./pages/account/Messages";
import MyProjects from "./pages/account/MyProjects";
import FreelancerLayout from "./pages/freelancer/FreelancerLayout";
import Intro from "./pages/freelancer/Intro";
import Services from "./pages/freelancer/Services";
import Portfolio from "./pages/freelancer/Portfolio";
import Reviews from "./pages/freelancer/Reviews";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import DbTest from "./pages/DbTest";
import UserSearch from "./pages/UserSearch";
import WalletPage from "./pages/wallet/WalletPage";
import PaymentSuccess from "./pages/payment/PaymentSuccess";
import PaymentFailed from "./pages/payment/PaymentFailed";

import { Toaster } from "sonner";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminDashboard from "./pages/admin/Dashboard";
import AdminUsers from "./pages/admin/Users";
import AdminProjects from "./pages/admin/Projects";
import AdminContracts from "./pages/admin/Contracts";
import AdminStatistics from "./pages/admin/Statistics";
import AdminSettings from "./pages/admin/Settings";
import AdminBanners from "./pages/admin/Banners";

// ================== AUTH HELPERS ==================
function PrivateRoute({ children }) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

function AdminOnly({ children }) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
  );
  if (!token) return <Navigate to="/login" replace />;
  if (user?.role?.toLowerCase() !== "admin") return <Navigate to="/" replace />;
  return children;
}

function GuestOnly({ children }) {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");
  return token ? <Navigate to="/" replace /> : children;
}

// ================== MAIN APP ==================
function AppContent() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith("/admin");
  
  const addNotification = useNotificationStore((s) => s.addNotification);
  const fetchFromServer = useNotificationStore((s) => s.fetchFromServer);
  const initConnection = useNotificationStore((s) => s.initConnection);
  useEffect(() => {
    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (token) {
      console.log("📦 Loading notifications from DB...");
      fetchFromServer(); // gọi API /api/notifications/my
      initConnection(); // khởi tạo SignalR realtime
    }
  }, [fetchFromServer, initConnection]);

  // ✅ Lắng nghe SignalR khi app load
  // useEffect(() => {
  //   startNotificationHub();
  //   notificationHub.on("ReceiveNotification", (notif) => {
  //     try {
  //       notif.payloadObj = JSON.parse(notif.payload || "{}");
  //     } catch {}
  //     console.log("🔔 Notification received:", notif);
  //     addNotification(notif);
  //   });

  //   return () => {
  //     notificationHub.off("ReceiveNotification");
  //   };
  // }, [addNotification]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/db-test" element={<DbTest />} />

          <Route
            path="/post-project"
            element={
              <PrivateRoute>
                <NewProject />
              </PrivateRoute>
            }
          />

          <Route
            path="/account"
            element={
              <PrivateRoute>
                <AccountLayout />
              </PrivateRoute>
            }
          >
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="my-projects" element={<MyProjects />} />
            <Route path="messages" element={<Messages />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          <Route path="/profile/:userId" element={<AccountLayout />}>
            <Route index element={<Profile />} />
          </Route>

          <Route path="/users" element={<UserSearch />} />

          <Route
            path="/login"
            element={
              <GuestOnly>
                <Login />
              </GuestOnly>
            }
          />
          <Route
            path="/register"
            element={
              <GuestOnly>
                <Register />
              </GuestOnly>
            }
          />

          <Route path="/freelancer" element={<FreelancerLayout />}>
            <Route index element={<Navigate to="intro" replace />} />
            <Route path="intro" element={<Intro />} />
            <Route path="services" element={<Services />} />
            <Route path="portfolio" element={<Portfolio />} />
            <Route path="reviews" element={<Reviews />} />
          </Route>

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <AdminOnly>
                <AdminLayout />
              </AdminOnly>
            }
          >
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/projects" element={<AdminProjects />} />
            <Route path="/admin/contracts" element={<AdminContracts />} />
            <Route path="/admin/statistics" element={<AdminStatistics />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
            <Route path="/admin/banners" element={<AdminBanners />} />
          </Route>

          <Route
            path="*"
            element={<div className="container-ld py-24">404</div>}
          />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
      <Toaster richColors position="top-center" />
    </div>
  );
}

export default function App() {
  return <AppContent />;
}
