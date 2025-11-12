import { Link, NavLink, useNavigate } from "react-router-dom";
import Button from "./ui/button";
import { jwtDecode } from "jwt-decode";
import { MessageSquare, User, Wallet, Shield, LogOut, Settings, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useWalletStore } from "../stores/walletStore";
import NotificationBell from "./NotificationBell";
import { useNotificationStore } from "../stores/notificationStore";

export default function Navbar() {
  const nav = useNavigate();
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
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

  useEffect(() => {
    if (userId) fetchBalance(userId);
  }, [userId, fetchBalance]);

  // Check if user is Admin (case-insensitive)
  const user = JSON.parse(
    localStorage.getItem("user") || sessionStorage.getItem("user") || "null"
  );
  const isAdmin = user?.role?.toLowerCase() === "admin";

  const item =
    "px-3 py-2 rounded-lg hover:bg-slate-100 text-sm flex items-center gap-2 transition-colors";
  const linkClass = ({ isActive }) =>
    `${item} ${isActive ? "text-brand-700 font-medium" : "text-slate-700"}`;
  const iconButtonClass = "p-2.5 rounded-lg hover:bg-slate-100 text-slate-700 transition-colors relative";

  const onLogout = async () => {
    try {
      const store = useNotificationStore.getState();
      await store.reset(); // 🧹 Dừng SignalR & xóa noti cũ (phải await)

      localStorage.removeItem("token");
      localStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");

      console.log("🚪 Logged out & cleared notifications");
      window.location.href = "/login";
    } catch (err) {
      console.error("Logout error:", err);
    }
  };
  const goWallet = () => nav("/wallet");

  const renderBalance = () => {
    const text = loading
      ? "..."
      : `₫ ${Number(balance || 0).toLocaleString("vi-VN")}`;
    return (
      <button
        onClick={goWallet}
        className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-2 text-sm font-medium hover:bg-emerald-100 transition-colors"
        title="Xem ví"
      >
        <Wallet className="w-4 h-4" />
        <span className="hidden sm:inline">{text}</span>
        <span className="sm:hidden">{Number(balance || 0) >= 1000000 ? `${(Number(balance || 0) / 1000000).toFixed(1)}M` : text}</span>
      </button>
    );
  };

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-slate-200">
      <div className="container-ld flex h-14 items-center justify-between gap-2">
        <Link to="/" className="font-bold text-lg flex-shrink-0">
          <span className="text-brand-700">Lan</span>Serve
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex gap-1 flex-1 justify-center max-w-2xl">
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

        <div className="flex items-center gap-2 flex-shrink-0">
          {token ? (
            <>
              {renderBalance()}
              
              <NavLink 
                to="/account/messages" 
                className={iconButtonClass}
                title="Tin nhắn"
              >
                <MessageSquare className="w-5 h-5" />
              </NavLink>

              <NotificationBell />

              {isAdmin && (
                <NavLink 
                  to="/admin" 
                  className={iconButtonClass}
                  title="Quản trị"
                >
                  <Shield className="w-5 h-5" />
                </NavLink>
              )}

              {/* Account Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowAccountMenu(!showAccountMenu)}
                  className={iconButtonClass}
                  title="Tài khoản"
                >
                  <User className="w-5 h-5" />
                </button>
                
                {showAccountMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-10" 
                      onClick={() => setShowAccountMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-20">
                      <NavLink
                        to={`/account/profile${userId ? `?id=${userId}` : ""}`}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        onClick={() => setShowAccountMenu(false)}
                      >
                        <User className="w-4 h-4" />
                        Hồ sơ
                      </NavLink>
                      <NavLink
                        to="/account/settings"
                        className="flex items-center gap-2 px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"
                        onClick={() => setShowAccountMenu(false)}
                      >
                        <Settings className="w-4 h-4" />
                        Cài đặt
                      </NavLink>
                      <hr className="my-1 border-slate-200" />
                      <button
                        onClick={() => {
                          setShowAccountMenu(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Đăng xuất
                      </button>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="lg:hidden p-2.5 rounded-lg hover:bg-slate-100 text-slate-700"
                aria-label="Menu"
              >
                {showMobileMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Đăng nhập
              </NavLink>
              <Button variant="primary" as={Link} to="/register" className="text-sm px-3 py-1.5">
                Đăng ký
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {showMobileMenu && token && (
        <div className="lg:hidden border-t border-slate-200 bg-white">
          <nav className="container-ld py-2 flex flex-col gap-1">
            <NavLink 
              to="/" 
              className={linkClass}
              onClick={() => setShowMobileMenu(false)}
            >
              Trang chủ
            </NavLink>
            <NavLink 
              to="/projects" 
              className={linkClass}
              onClick={() => setShowMobileMenu(false)}
            >
              Dự án
            </NavLink>
            <NavLink 
              to="/post-project" 
              className={linkClass}
              onClick={() => setShowMobileMenu(false)}
            >
              Đăng dự án
            </NavLink>
            <NavLink 
              to="/users" 
              className={linkClass}
              onClick={() => setShowMobileMenu(false)}
            >
              Người dùng
            </NavLink>
            <NavLink 
              to="/how-it-works" 
              className={linkClass}
              onClick={() => setShowMobileMenu(false)}
            >
              Cách hoạt động
            </NavLink>
          </nav>
        </div>
      )}
    </header>
  );
}
