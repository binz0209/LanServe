import { Link, NavLink, useNavigate } from "react-router-dom";
import Button from "./ui/button";
import { jwtDecode } from "jwt-decode";
import { MessageSquare, User, Wallet, Shield } from "lucide-react"; // 👈 thêm Shield icon
import { useEffect } from "react";
import { useWalletStore } from "../stores/walletStore"; // 👈 import store

export default function Navbar() {
  const nav = useNavigate();
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  let userId = null;
  if (token) {
    try {
      const decoded = jwtDecode(token);
      userId =
        decoded.sub ||
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] ||
        decoded.userId ||
        null;
    } catch (e) {
      console.error("Decode token error:", e);
    }
  }

  const { balance, fetchBalance, loading } = useWalletStore();

  // Tạm thời bỏ qua fetch wallet để tránh lỗi 404
  // useEffect(() => {
  //   if (userId) fetchBalance(userId);
  // }, [userId, fetchBalance]);

  // Check if user is Admin (case-insensitive)
  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
  );
  const isAdmin = user?.role?.toLowerCase() === "admin";

  // Log user info for debugging

  const item =
    "px-3 py-2 rounded-lg hover:bg-slate-100 text-sm flex items-center gap-1";
  const linkClass = ({ isActive }) =>
    `${item} ${isActive ? "text-brand-700 font-medium" : "text-slate-700"}`;

  const onLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("token");
    sessionStorage.removeItem("user");
    nav("/login", { replace: true });
  };

  const goWallet = () => nav("/wallet");

  const renderBalance = () => {
    const text = loading
      ? "..."
      : `₫ ${Number(balance || 0).toLocaleString("vi-VN")}`;
    return (
      <button
        onClick={goWallet}
        className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 text-sm"
        title="Xem ví"
      >
        <Wallet className="w-4 h-4" />
        <span className="font-medium">{text}</span>
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="container-ld flex h-14 items-center justify-between">
        <Link to="/" className="font-bold text-lg">
          <span className="text-brand-700">Lan</span>Serve
        </Link>

        <nav className="hidden md:flex gap-1">
          <NavLink to="/" className={linkClass}>
            Trang chủ
          </NavLink>
          <NavLink to="/projects" className={linkClass}>
            Dự án
          </NavLink>
          <NavLink to="/post-project" className={linkClass}>
            Đăng dự án
          </NavLink>
          <NavLink to="/users" className={linkClass}>
            Người dùng
          </NavLink>
          <NavLink to="/how-it-works" className={linkClass}>
            Cách hoạt động
          </NavLink>
        </nav>

        <div className="flex items-center gap-2">
          {token ? (
            <>
              {renderBalance()}
              {/* 👈 nút hiển thị số dư & vào trang ví */}
              <NavLink to="/account/messages" className={linkClass}>
                <MessageSquare className="w-5 h-5" />
              </NavLink>
              <NavLink
                to={`/account/profile${userId ? `?id=${userId}` : ""}`}
                className={linkClass}
              >
                <User className="w-5 h-5" /> Tài khoản
              </NavLink>
              {isAdmin && (
                <NavLink to="/admin" className={linkClass}>
                  <Shield className="w-5 h-5" /> Admin
                </NavLink>
              )}
              <Button onClick={onLogout}>Đăng xuất</Button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Đăng nhập
              </NavLink>
              <Button variant="primary" as={Link} to="/register">
                Đăng ký
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
