import { useState, useEffect } from "react";
import { useNotificationStore } from "../stores/notificationStore";
import { useNavigate } from "react-router-dom";
import { api } from "../lib/api";

export default function NotificationBell() {
  const { items, markRead, fetchFromServer } = useNotificationStore();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  // Load notifications khi component mount
  useEffect(() => {
    fetchFromServer();
  }, [fetchFromServer]);

  // Refresh notifications khi items thay đổi (từ SignalR)
  useEffect(() => {
    console.log("🔔 NotificationBell: items changed", items.length);
  }, [items]);

  // Sắp xếp notifications: mới nhất trước, unread trước
  const sortedItems = [...items].sort((a, b) => {
    // Unread trước
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1;
    }
    // Sau đó sắp xếp theo thời gian (mới nhất trước)
    const dateA = new Date(a.createdAt || 0).getTime();
    const dateB = new Date(b.createdAt || 0).getTime();
    return dateB - dateA;
  });

  const unread = items.filter((n) => !n.isRead).length;
  
  // Debug logging
  useEffect(() => {
    console.log("🔔 NotificationBell Debug:", {
      totalItems: items.length,
      unreadCount: unread,
      sortedCount: sortedItems.length,
      items: items.map(n => ({ id: n.id, type: n.type, isRead: n.isRead, title: n.title }))
    });
  }, [items, unread, sortedItems.length]);

  const handleClick = async (n) => {
    // Đánh dấu đã đọc
    if (!n.isRead && n.id) {
      try {
        await api.post(`/api/notifications/${n.id}/read`);
        markRead(n.id);
      } catch (err) {
        console.error("Failed to mark notification as read:", err);
      }
    }

    // Xử lý navigation dựa trên type
    if (n.type === "NewProject") {
      const projectId = n.payloadObj?.projectId;
      if (projectId) {
        navigate(`/projects/${projectId}`);
      } else {
        navigate(`/projects`);
      }
    } else {
      const key = n.payloadObj?.conversationKey;
      const projectId = n.payloadObj?.projectId;
      if (key) {
        navigate(`/account/messages?key=${key}&projectId=${projectId}`);
      } else {
        navigate(`/account/messages`);
      }
    }
    setOpen(false);
  };

  return (
    <div className="relative">
      <button
        className="p-2 rounded-full hover:bg-gray-100 relative"
        onClick={() => {
          console.log("🔔 Bell clicked. Items:", items.length, "Unread:", unread);
          setOpen(!open);
          if (!open) {
            // Refresh khi mở
            fetchFromServer();
          }
        }}
      >
        🔔
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full min-w-[20px] flex items-center justify-center font-bold">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border rounded-2xl shadow-xl p-0 max-h-96 overflow-hidden z-50">
          <div className="flex justify-between items-center p-3 border-b bg-gray-50">
            <div className="text-sm font-semibold">
              Thông báo {unread > 0 && <span className="text-red-500">({unread} mới)</span>}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                fetchFromServer();
              }}
              className="text-xs text-blue-600 hover:text-blue-800 px-2 py-1 rounded hover:bg-blue-50"
            >
              🔄
            </button>
          </div>
          <div className="overflow-y-auto max-h-80">
            {sortedItems.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-8">
                Không có thông báo
              </div>
            ) : (
              sortedItems.map((n) => {
            // Xử lý title dựa trên type
            let title = n.title || n.type;
            if (n.type === "ProposalAccepted") {
              title = "Đề xuất đã được chấp nhận";
            } else if (n.type === "NewMessage") {
              title = n.title || "Bạn có tin nhắn mới";
            } else if (n.type === "NewProposal") {
              title = n.title || "Đề xuất mới";
            } else if (n.type === "ProposalSent") {
              title = n.title || "Đã gửi đề xuất";
            } else if (n.type === "NewProject") {
              title = n.title || "Dự án mới";
            }

            return (
              <div
                key={n.id}
                onClick={() => handleClick(n)}
                className={`cursor-pointer p-3 hover:bg-gray-50 rounded-xl border-b last:border-none ${
                  !n.isRead ? "bg-blue-50 border-l-4 border-l-blue-500" : ""
                }`}
              >
                <div className="text-sm font-semibold text-gray-800">
                  {title}
                </div>
                {n.message && (
                  <div className="text-xs text-gray-600 break-words mt-1">
                    {n.message}
                  </div>
                )}
                <div className="text-[10px] text-gray-400 mt-2">
                  {new Date(n.createdAt).toLocaleString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            );
            })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
