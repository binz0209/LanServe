import { useEffect, useState } from "react";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { jwtDecode } from "jwt-decode";
import { GoogleLogin } from "@react-oauth/google";
import { toast } from "sonner";


export default function Login() {
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [showForgot, setShowForgot] = useState(false);
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập code + mật khẩu mới
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");



  const onSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return setErr("Vui lòng nhập đủ thông tin.");

    setErr("");
    setLoading(true);
    try {
      const res = await api.post("/api/auth/login", form);
      const token = res.data?.accessToken || res.data?.token;
      if (!token) throw new Error("Không nhận được token từ server");

      // Lưu token
      localStorage.setItem("token", token);

      // Gắn header mặc định ngay lập tức cho các request sau login
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      // Lưu user (nếu BE trả về)
      if (res.data?.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
      }


      const decoded = jwtDecode(token);
      const userId =
        decoded.sub ||
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        decoded.userId ||
        null;

      console.log("Đăng nhập thành công ✅");
      console.log("JWT Token:", token);
      console.log("UserID:", userId);
      // Điều hướng
      nav("/", { replace: true });
    } catch (error) {
      console.error("Login error:", error);
      const msg =
        error?.response?.data?.message ||
        error?.message ||
        "Đăng nhập thất bại";
      setErr(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;
      const res = await api.post("/api/auth/google", { idToken }); // sửa route cho đúng

      const token = res.data?.accessToken;
      if (!token) throw new Error("Google login failed: No token");

      localStorage.setItem("token", token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      toast.success("Đăng nhập bằng Google thành công!");
      nav("/", { replace: true });
    } catch (err) {
      console.error("Google login error:", err);
      toast.error(err.response?.data?.message || "Đăng nhập Google thất bại");
    }
  };

  const handleSendCode = async () => {
    if (!email) return toast.error("Vui lòng nhập email.");
    try {
      await api.post("api/auth/forgot-password", { email });
      toast.success("Đã gửi mã xác nhận đến email của bạn!");
      setStep(2);
    } catch (err) {
      toast.error(err.response?.data?.message || "Không thể gửi mã xác nhận.");
    }
  };

  const handleResetPassword = async () => {
    if (!code || !newPassword) return toast.error("Vui lòng nhập đầy đủ thông tin.");
    try {
      await api.post("/api/auth/reset-password", { email, code, newPassword });
      toast.success("Đặt lại mật khẩu thành công!");
      setShowForgot(false);
      setStep(1);
      setEmail("");
      setCode("");
      setNewPassword("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Đặt lại mật khẩu thất bại.");
    }
  };


  return (
    <div className="container-ld py-12 grid md:grid-cols-2 gap-10">
      <div className="hidden md:block">
        <div className="h-80 rounded-2xl bg-gradient-to-br from-blue-200 to-orange-200" />
        <h2 className="mt-6 text-2xl font-semibold">Chào mừng trở lại LanServe</h2>
        <p className="text-slate-600 mt-2">
          Đăng nhập để quản lý dự án, trao đổi và nhận việc nhanh chóng.
        </p>
      </div>

      <div className="card">
        <form className="card-body space-y-4" onSubmit={onSubmit}>
          <h1 className="text-2xl font-semibold">Đăng nhập</h1>
          {err && <div className="text-sm text-red-600">{err}</div>}
          <div>
            <label className="text-sm">Email</label>
            <Input
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm">Mật khẩu</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2">
              <input type="checkbox" /> Ghi nhớ đăng nhập
            </label>
            <button
              type="button"
              onClick={() => setShowForgot(true)}
              className="text-brand-700 hover:underline"
            >
              Quên mật khẩu?
            </button>

          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </Button>
          <div className="flex justify-center mt-4">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Google Login thất bại")}
            />
          </div>
          <div className="text-sm text-center text-slate-600">
            Chưa có tài khoản?{" "}
            <Link to="/register" className="text-brand-700 hover:underline">
              Đăng ký
            </Link>
          </div>
        </form>
      </div>

      {showForgot && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-lg w-full max-w-md space-y-4">
            <h2 className="text-xl font-semibold text-center">
              {step === 1 ? "Quên mật khẩu" : "Đặt lại mật khẩu"}
            </h2>

            {step === 1 ? (
              <>
                <p className="text-sm text-slate-600">
                  Nhập email để nhận mã xác nhận đặt lại mật khẩu.
                </p>
                <Input
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowForgot(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleSendCode}>Gửi mã</Button>
                </div>
              </>
            ) : (
              <>
                <Input
                  placeholder="Mã xác nhận"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="Mật khẩu mới"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={() => setShowForgot(false)}>
                    Hủy
                  </Button>
                  <Button onClick={handleResetPassword}>Đổi mật khẩu</Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
