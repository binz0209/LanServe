import { useState } from "react";
import Input from "../../components/ui/input";
import Button from "../../components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import api from "../../lib/api";
import { jwtDecode } from "jwt-decode";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";


export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    if (!form.name || !form.email || !form.password || !form.confirm)
      return setErr("Vui lòng nhập đủ thông tin.");
    if (form.password !== form.confirm)
      return setErr("Mật khẩu xác nhận không khớp.");
    try {
      const res = await api.post("/api/auth/register", {
        fullName: form.name,
        email: form.email,
        password: form.password,
        role: "User",
      });
      
      const token = res.data?.accessToken || res.data?.token;
      if (!token) throw new Error("Không nhận được token từ server");

      localStorage.setItem("token", token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      // Decode JWT để lấy thông tin user
      const decoded = jwtDecode(token);
      console.log("Decoded JWT (Register):", decoded);
      
      const userId =
        decoded.sub ||
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        decoded.userId;
      
      const email = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
                    decoded.email ||
                    form.email;
      
      const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
                   decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"] ||
                   decoded["role"] ||
                   decoded.role ||
                   "User";

      // Lưu user object vào localStorage
      const userData = {
        id: userId,
        email: email,
        role: role
      };
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("UserData saved (Register):", userData);

      toast.success("Đăng ký thành công!");
      nav("/account/profile");
    } catch (err) {
      console.error("Register failed:", err);
      setErr(err.response?.data?.message || "Đăng ký thất bại.");
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      const idToken = credentialResponse.credential;
      const res = await api.post("/api/auth/google", { idToken });
      
      const token = res.data?.accessToken;
      if (!token) throw new Error("Google login failed: No token");

      localStorage.setItem("token", token);
      api.defaults.headers.common.Authorization = `Bearer ${token}`;

      // Decode JWT để lấy thông tin user
      const decoded = jwtDecode(token);
      console.log("Decoded JWT (Google Register):", decoded);
      
      const userId =
        decoded.sub ||
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        decoded.userId;
      
      const email = decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"] ||
                    decoded.email;
      
      const role = decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] ||
                   decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/role"] ||
                   decoded["role"] ||
                   decoded.role ||
                   "User";

      // Lưu user object vào localStorage
      const userData = {
        id: userId,
        email: email,
        role: role
      };
      localStorage.setItem("user", JSON.stringify(userData));
      console.log("UserData saved (Google Register):", userData);

      toast.success("Đăng nhập bằng Google thành công!");
      nav("/account/profile");
    } catch (err) {
      console.error("Google login failed:", err);
      toast.error(err.response?.data?.message || "Đăng nhập Google thất bại.");
    }
  };

  return (
    <div className="container-ld py-12 grid md:grid-cols-2 gap-10">
      <div className="hidden md:block order-2 md:order-1">
        <div className="h-80 rounded-2xl bg-gradient-to-br from-orange-200 to-blue-200" />
        <h2 className="mt-6 text-2xl font-semibold">Tạo tài khoản LanServe</h2>
        <p className="text-slate-600 mt-2">Bắt đầu đăng dự án, nhận job và xây hồ sơ uy tín.</p>
      </div>

      <div className="card order-1 md:order-2">
        <form className="card-body space-y-4" onSubmit={onSubmit}>
          <h1 className="text-2xl font-semibold">Đăng ký</h1>
          {err && <div className="text-sm text-red-600">{err}</div>}
          <div>
            <label className="text-sm">Họ và tên</label>
            <Input
              placeholder="Nguyễn Văn A"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
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
          <div>
            <label className="text-sm">Xác nhận mật khẩu</label>
            <Input
              type="password"
              placeholder="••••••••"
              value={form.confirm}
              onChange={(e) => setForm({ ...form, confirm: e.target.value })}
            />
          </div>
          <Button type="submit" className="w-full">Tạo tài khoản</Button>
          <div className="text-center text-slate-500">Hoặc</div>
          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => toast.error("Login Google thất bại")}
            />
          </div>
          <div className="text-sm text-center text-slate-600">
            Đã có tài khoản?{" "}
            <Link to="/login" className="text-brand-700 hover:underline">Đăng nhập</Link>
          </div>
        </form>
      </div>
    </div>
  );
}
