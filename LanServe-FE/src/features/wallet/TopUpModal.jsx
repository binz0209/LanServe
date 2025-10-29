import { useState } from "react";
import api from "../../lib/api";
import Button from "../../components/ui/button";

export default function TopUpModal({ open, onClose, userId, onSuccess }) {
  const [amount, setAmount] = useState(100000);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  if (!open) return null;

  const submit = async (e) => {
    e.preventDefault();
    if (!userId) return alert("Thiếu userId");
    const amt = Number(amount);
    if (!amt || amt <= 0) return alert("Số tiền không hợp lệ");

    try {
      setLoading(true);
      const res = await api.post("/api/payments/topup", {
        userId,
        amount: amt,
        orderInfo: note || `Topup ${amt} VND`,
      });
      const url = res.data?.paymentUrl;
      if (!url) throw new Error("paymentUrl rỗng");
      onSuccess?.(amt);
      window.location.href = url; // redirect sang VNPAY
    } catch (e) {
      console.error(e);
      alert(e?.response?.data || e.message || "Tạo giao dịch thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <form
        onSubmit={submit}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-5"
      >
        <h3 className="text-lg font-semibold mb-3">Nạp tiền vào ví</h3>

        <label className="block text-sm mb-1">Số tiền (VND)</label>
        <input
          type="number"
          min={10000}
          step={1000}
          className="w-full border rounded-lg px-3 py-2 mb-3"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Nhập số tiền (VND)"
          required
        />

        <label className="block text-sm mb-1">Ghi chú (tuỳ chọn)</label>
        <input
          type="text"
          className="w-full border rounded-lg px-3 py-2 mb-4"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ví dụ: Nạp ví tháng 10"
        />

        <div className="flex items-center justify-end gap-2">
          <Button type="button" onClick={onClose} variant="secondary">
            Huỷ
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Đang tạo..." : "Nạp tiền"}
          </Button>
        </div>
      </form>
    </div>
  );
}
