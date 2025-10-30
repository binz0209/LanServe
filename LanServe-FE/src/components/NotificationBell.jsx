import { useState } from "react";
import { useNotificationStore } from "../stores/notificationStore";
import { useNavigate } from "react-router-dom";

export default function NotificationBell() {
  const { items } = useNotificationStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const unread = items.filter((n) => !n.isRead).length;

  const handleClick = (n) => {
    const key = n.payloadObj?.conversationKey;
    const projectId = n.payloadObj?.projectId;
    if (key) {
      navigate(`/account/messages?key=${key}&projectId=${projectId}`);
    } else {
      navigate(`/account/messages`);
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="p-2 rounded-full hover:bg-gray-100 relative"
        onClick={() => setOpen(!open)}
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1 rounded-full">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute left-1/2 -translate-x-1/2 mt-3 w-80 bg-white border rounded-2xl shadow-lg p-3 max-h-96 overflow-y-auto">
          {items.length === 0 && (
            <div className="text-gray-500 text-sm text-center py-3">
              Không có thông báo
            </div>
          )}
          {items.map((n) => (
            <div
              key={n.id}
              onClick={() => handleClick(n)}
              className="cursor-pointer p-2 hover:bg-gray-50 rounded-xl border-b last:border-none"
            >
              <div className="text-sm font-semibold text-gray-800">
                {n.type === "ProposalAccepted"
                  ? "Đề xuất đã được chấp nhận"
                  : n.type}
              </div>

              <div className="text-xs text-gray-600 break-all">
                {n.message || n.payloadObj?.action || n.payload}
              </div>
              <div className="text-[10px] text-gray-400 mt-1">
                {new Date(n.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
