// src/pages/payment/PaymentFailed.jsx
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function PaymentFailed() {
  const nav = useNavigate();
  const [params] = useSearchParams();
  const orderId = params.get("orderId");
  const code = params.get("code") || "unknown";

  useEffect(() => {
    const t = setTimeout(() => nav("/wallet"), 1500);
    return () => clearTimeout(t);
  }, [nav]);

  return (
    <div className="container-ld py-10 text-center">
      <h1 className="text-2xl font-bold text-rose-600">Thanh toán thất bại</h1>
      <p className="mt-2 text-slate-600">Mã giao dịch: <b>{orderId}</b> – Code: <b>{code}</b></p>
      <p className="mt-2 text-slate-500">Đang quay lại Ví...</p>
    </div>
  );
}
