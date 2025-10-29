import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
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

// Chặn route khi chưa login (đọc trực tiếp localStorage)
function PrivateRoute({ children }) {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" replace />;
}

// Chặn route khi đã login
function GuestOnly({ children }) {
  const token = localStorage.getItem("token");
  return token ? <Navigate to="/" replace /> : children;
}

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/wallet" element={<WalletPage />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/db-test" element={<DbTest />} />
          <Route path="/" element={<Home />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/projects" element={<Projects />} />
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
          <Route
            path="*"
            element={<div className="container-ld py-24">404</div>}
          />
        </Routes>
      </main>
      <Footer />
      <Toaster richColors position="top-center" />
    </div>
  );
}
