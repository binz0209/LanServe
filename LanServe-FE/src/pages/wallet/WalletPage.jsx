import { useEffect, useMemo, useState } from "react";
import { jwtDecode } from "jwt-decode";
import { useWalletStore } from "../../stores/walletStore";
import TopUpModal from "../../features/wallet/TopUpModal";
import Button from "../../components/ui/button";

function SuccessBanner({ orderId, onClose }) {
  return (
    <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-800 px-4 py-3 flex items-start justify-between">
      <div>
        <div className="font-semibold">Nạp tiền thành công</div>
        {orderId && (
          <div className="text-sm">
            Mã giao dịch: <b>{orderId}</b>
          </div>
        )}
      </div>
      <button onClick={onClose} className="text-emerald-700 hover:underline">
        Đóng
      </button>
    </div>
  );
}

export default function WalletPage() {
  const token = localStorage.getItem("token");
  const userId = useMemo(() => {
    if (!token) return null;
    try {
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

  const {
    balance,
    fetchBalance,
    loading,
    txns,
    fetchTopups,
    txLoading,
  } = useWalletStore();

  const [open, setOpen] = useState(false);
  const [success, setSuccess] = useState(null);
  const [sortDesc, setSortDesc] = useState(true); // true: mới → cũ

  useEffect(() => {
    if (userId) {
      fetchBalance(userId);
      fetchTopups(userId, 20);  // ← gọi API topups
    }
  }, [userId, fetchBalance, fetchTopups]);

  // đọc cờ từ PaymentSuccess đặt sẵn
  useEffect(() => {
    const raw = sessionStorage.getItem("wallet_topup_success");
    if (raw) {
      try {
        const data = JSON.parse(raw);
        if (data?.ok) setSuccess({ orderId: data.orderId });
      } catch {}
      sessionStorage.removeItem("wallet_topup_success"); // dùng 1 lần rồi xoá
    }
  }, []);

  const sortedTxns = useMemo(() => {
    const arr = [...txns];
    arr.sort((a, b) => {
      const da = new Date(a.createdAt);
      const db = new Date(b.createdAt);
      return sortDesc ? db - da : da - db;
    });
    return arr;
  }, [txns, sortDesc]);

  const fmt = (n) => `₫ ${Number(n || 0).toLocaleString("vi-VN")}`;
  const fmtDate = (s) => {
    if (!s) return "-";
    const d = new Date(s);
    return isNaN(d.getTime()) ? s : d.toLocaleString("vi-VN");
  };

  return (
    <div className="container-ld py-6">
      {success && (
        <SuccessBanner orderId={success.orderId} onClose={() => setSuccess(null)} />
      )}

      <h1 className="text-2xl font-bold mb-4">Ví của tôi</h1>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border p-5 bg-white shadow-sm">
          <div className="text-slate-500 text-sm">Số dư khả dụng</div>
          <div className="text-3xl font-semibold mt-1">
            {loading ? "..." : fmt(balance)}
          </div>
          <div className="mt-4 flex gap-2">
            <Button onClick={() => setOpen(true)}>Nạp tiền</Button>
          </div>
        </div>

        <div className="rounded-2xl border p-5 bg-white shadow-sm">
          <div className="text-slate-600">Gợi ý</div>
          <ul className="list-disc pl-5 text-sm text-slate-600 mt-2">
            <li>Nhấn “Nạp tiền” để đi đến cổng thanh toán VNPAY.</li>
            <li>Sau khi thanh toán, hệ thống tự động cộng tiền vào ví.</li>
          </ul>
        </div>
      </div>

      {/* Lịch sử giao dịch */}
      <div className="mt-6 rounded-2xl border bg-white shadow-sm">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="font-semibold">Lịch sử giao dịch</h2>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">Sắp xếp:</span>
            <Button
              variant="secondary"
              onClick={() => setSortDesc((v) => !v)}
              title="Đảo thứ tự ngày"
            >
              {sortDesc ? "Mới → Cũ" : "Cũ → Mới"}
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-50 text-slate-600">
              <tr>
                <th className="text-left px-4 py-2 w-[180px]">Thời gian</th>
                <th className="text-left px-4 py-2">Loại</th>
                <th className="text-right px-4 py-2">Số tiền</th>
                <th className="text-right px-4 py-2">Số dư sau</th>
                <th className="text-left px-4 py-2">Ghi chú</th>
              </tr>
            </thead>
            <tbody>
              {txLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    Đang tải giao dịch...
                  </td>
                </tr>
              ) : sortedTxns.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    Chưa có giao dịch
                  </td>
                </tr>
              ) : (
                sortedTxns.map((x) => (
                  <tr key={x.id || x._id}>
                    <td className="px-4 py-2">{fmtDate(x.createdAt)}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex px-2 py-1 rounded-full text-xs ${
                          x.type === "TopUp"
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : x.type === "Withdraw"
                            ? "bg-amber-50 text-amber-700 border border-amber-200"
                            : "bg-slate-50 text-slate-700 border border-slate-200"
                        }`}
                      >
                        {x.type || "-"}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-right font-medium">
                      {fmt(x.amount)}
                    </td>
                    <td className="px-4 py-2 text-right">{fmt(x.balanceAfter)}</td>
                    <td className="px-4 py-2">{x.note || "-"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <TopUpModal
        open={open}
        onClose={() => setOpen(false)}
        userId={userId}
        onSuccess={() => {}}
      />
    </div>
  );
}
