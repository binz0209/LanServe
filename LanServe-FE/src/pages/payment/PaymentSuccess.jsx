// src/pages/payment/PaymentSuccess.jsx
import { useEffect, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import api from "../../lib/api";                    // 👈 dùng axios instance
import { useWalletStore } from "../../stores/walletStore"; // 👈 sửa path: store (không phải stores)

export default function PaymentSuccess() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get("orderId");

  // lấy userId từ token để refresh số dư
  const token = localStorage.getItem("token");
  const userId = useMemo(() => {
    try {
      if (!token) return null;
      const d = jwtDecode(token);
      return (
        d.sub ||
        d["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        d.userId ||
        null
      );
    } catch {
      return null;
    }
  }, [token]);

  const { fetchBalance } = useWalletStore();

  useEffect(() => {
    (async () => {
      try {
        // 1) gọi BE xác nhận topup theo orderId (vnp_TxnRef)
        if (userId && orderId) {
          await api.get("/api/wallets/topup-result", { params: { orderId, userId } });
        }
        // 2) refresh số dư
        if (userId) await fetchBalance(userId);
        // 3) set cờ để /wallet hiển thị banner “Nạp tiền thành công”
        sessionStorage.setItem("wallet_topup_success", JSON.stringify({ ok: true, orderId }));
      } catch (e) {
        // nếu BE chưa bật endpoint topup-result, vẫn tiếp tục chuyển trang
        console.warn("Confirm topup failed or skipped:", e?.message || e);
      } finally {
        setTimeout(() => nav("/wallet"), 900);
      }
    })();
  }, [userId, orderId, fetchBalance, nav]);

  return (
    <div className="container-ld py-10 text-center">
      <h1 className="text-2xl font-bold text-emerald-600">Nạp tiền thành công</h1>
      <p className="mt-2 text-slate-600">
        Mã giao dịch: <b>{orderId}</b>
      </p>
      <p className="mt-2 text-slate-500">Đang chuyển về trang Ví…</p>
    </div>
  );
}
