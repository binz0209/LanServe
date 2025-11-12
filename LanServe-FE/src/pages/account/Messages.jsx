// src/pages/Messages.jsx
import { useEffect, useState, useRef, useMemo, useCallback } from "react";
import { jwtDecode } from "jwt-decode";
import DOMPurify from "dompurify";
import * as signalR from "@microsoft/signalr";
import api from "../../lib/api";
import EmptyState from "../../components/EmptyState";
import Spinner from "../../components/Spinner";

// Helper: tách key thành projectId / receiverId / senderId
const parseKey = (key = "") => {
  const [projectId = "null", receiverId = "", senderId = ""] =
    String(key).split(":");
  return { projectId, receiverId, senderId };
};

// Helper: chuẩn hóa Mongo Extended JSON -> object phẳng
function normalizeMessage(m = {}) {
  const getOid = (o) => (o && o.$oid) || o || null;
  const getDate = (d) => {
    if (!d) return null;
    const raw = (d.$date && (d.$date.$numberLong || d.$date)) || d;
    const n = Number(raw);
    try {
      return Number.isFinite(n)
        ? new Date(n).toISOString()
        : new Date(raw).toISOString();
    } catch {
      return new Date().toISOString();
    }
  };
  return {
    id: getOid(m._id) || m.id || crypto.randomUUID(),
    conversationKey: m.conversationKey || "",
    projectId: getOid(m.projectId) || m.projectId || null,
    senderId: getOid(m.senderId) || m.senderId || null,
    receiverId: getOid(m.receiverId) || m.receiverId || null,
    text: m.text || m.html || "",
    createdAt: getDate(m.createdAt) || new Date().toISOString(),
    isRead: Boolean(m.isRead),
  };
}

const isHtml = (s) => typeof s === "string" && /^\s*</.test(s);

// ---- API hành động Proposal ----
async function handleProposalAction(action, proposalId, projectId) {
  const url = `api/Proposals/${proposalId}/${action}`; // ✅ viết hoa Proposals
  const payload = { projectId };
  const res = await api.post(url, payload);
  return res.data;
}

// ---- API chỉnh sửa Proposal ----
async function handleProposalEdit(proposalId, price) {
  const url = `api/Proposals/${proposalId}/edit`; // ✅ viết hoa Proposals
  const res = await api.put(url, price, {
    headers: { "Content-Type": "application/json" },
  });
  return res.data;
}

// ---- Fetch status thật từ API ----
async function fetchProposalStatus(proposalId) {
  if (!proposalId) return null;
  try {
    const res = await api.get(`api/Proposals/${proposalId}`); // ✅ viết hoa Proposals
    const status = (res.data?.status || "").trim().toLowerCase();
    console.log("[Proposal] status:", status);
    return status;
  } catch (err) {
    console.warn("[Proposal] fetch failed:", err.message);
    return null;
  }
}

// ---- Chèn 3 nút nếu status === "pending" ----
async function withActionButtonsIfPending(safeHtml, currentUserId) {
  const host = document.createElement("div");
  host.innerHTML = safeHtml;
  const card = host.querySelector(".proposal-card");
  if (!card) return safeHtml;

  const proposalId = card.getAttribute("data-proposal-id");
  if (!proposalId) return safeHtml;

  const status = await fetchProposalStatus(proposalId);
  if (status !== "pending") return safeHtml;

  // 🧩 Fetch chi tiết proposal để biết ai là chủ (sender)
  let ownerId = null;
  try {
    const res = await api.get(`api/Proposals/${proposalId}`);
    ownerId =
      res.data?.senderId ||
      res.data?.freelancerId ||
      res.data?.createdBy ||
      null;
  } catch {
    console.warn(`[Proposal ${proposalId}] cannot fetch owner`);
  }

  const isOwner = ownerId && ownerId === currentUserId;

  const actions = document.createElement("div");
  actions.className = "actions flex gap-2 mt-2";

  actions.innerHTML = `
    ${
      !isOwner
        ? `<button data-action="accept" class="btn btn-sm btn-success">✅ Đồng ý</button>`
        : ""
    }
    <button data-action="edit" class="btn btn-sm btn-outline">✏️ Chỉnh sửa</button>
    <button data-action="cancel" class="btn btn-sm btn-danger">❌ Hủy đề xuất</button>
  `;
  card.appendChild(actions);

  return host.innerHTML;
}

export default function Messages() {
  const [payoutLoading, setPayoutLoading] = useState(false);
  const [usersMap, setUsersMap] = useState(new Map());
  const [conversations, setConversations] = useState([]);
  const [activeUser, setActiveUser] = useState(null);
  const [activeConversationKey, setActiveConversationKey] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Modal edit
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingProposalId, setEditingProposalId] = useState(null);
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [newPrice, setNewPrice] = useState("");
  const [editLoading, setEditLoading] = useState(false);

  // 🆕 Contract modal
  const [showContractModal, setShowContractModal] = useState(false);
  const [contractData, setContractData] = useState(null);

  // 🆕 Cancel confirm (nếu bạn muốn confirm)
  const [confirmingCancel, setConfirmingCancel] = useState(false);
  const [cancelProposalId, setCancelProposalId] = useState("");

  const containerRef = useRef(null);
  const [autoStick, setAutoStick] = useState(true);
  const messageHubRef = useRef(null);
  
  // Infinite scroll for conversations
  const [displayedConversationsCount, setDisplayedConversationsCount] = useState(10);
  const [isLoadingMoreConversations, setIsLoadingMoreConversations] = useState(false);
  const conversationsContainerRef = useRef(null);
  const CONVERSATIONS_PER_PAGE = 10;

  // Pagination for messages in thread
  const [allMessages, setAllMessages] = useState([]); // Tất cả messages đã load
  const [displayedMessagesCount, setDisplayedMessagesCount] = useState(20); // Số messages hiển thị (từ cuối lên)
  const [isLoadingMoreMessages, setIsLoadingMoreMessages] = useState(false);
  const MESSAGES_PER_PAGE = 20;
  // --- Helpers: FE-only check ---
  async function getProposalAmount(proposalId) {
    const res = await api.get(`api/Proposals/${proposalId}`); // giữ nguyên pattern "api/..."
    const amt = res?.data?.bidAmount ?? res?.data?.BidAmount ?? 0;
    return Number(amt) || 0;
  }

  async function getMyWalletBalance(userId) {
    // BE Dev/Test: [HttpGet("{userId}")] => /api/wallets/{userId}
    const res = await api.get(`api/wallets/${userId}`);
    // kỳ vọng { balance: number }
    const bal = res?.data?.balance ?? res?.data?.Balance ?? 0;
    return Number(bal) || 0;
  }

  // Load more messages when scrolling to top
  const handleMessagesScroll = useCallback(() => {
    if (isLoadingMoreMessages) return;
    if (displayedMessagesCount >= allMessages.length) return;

    const container = containerRef.current;
    if (!container) return;

    const scrollTop = container.scrollTop;
    
    // Load more when scroll to top (within 100px from top)
    if (scrollTop < 100 && displayedMessagesCount < allMessages.length) {
      setIsLoadingMoreMessages(true);
      setTimeout(() => {
        setDisplayedMessagesCount(prev => Math.min(prev + MESSAGES_PER_PAGE, allMessages.length));
        setIsLoadingMoreMessages(false);
        
        // Maintain scroll position
        const scrollHeight = container.scrollHeight;
        setTimeout(() => {
          container.scrollTop = container.scrollHeight - scrollHeight + container.scrollTop;
        }, 50);
      }, 300);
    }
  }, [isLoadingMoreMessages, displayedMessagesCount, allMessages.length]);

  const onScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const threshold = 40;
    const atBottom =
      el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    setAutoStick(atBottom);
    
    // Handle loading more messages when scrolling up
    handleMessagesScroll();
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (autoStick) el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
  }, [messages, activeUser, autoStick]);

  useEffect(() => {
    const token =
      localStorage.getItem("token") || sessionStorage.getItem("token");
    if (!token) return setLoading(false);
    try {
      const decoded = jwtDecode(token);
      const id =
        decoded.sub ||
        decoded[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ] ||
        decoded.userId ||
        null;
      setCurrentUserId(id);
    } catch (err) {
      console.error("Decode token error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!currentUserId) return;
    const load = async () => {
      try {
        const { data: convs } = await api.get("api/messages/my-conversations");
        const list = Array.isArray(convs) ? convs : [];
        setConversations(list);

        const { data: allUsers } = await api.get("api/users");
        const newMap = new Map(
          (allUsers || []).map((u) => [u.id || u._id || u.userId, u])
        );
        setUsersMap(newMap);

        if (!activeUser && list.length > 0) {
          const first = list[0];
          const firstPartner = newMap.get(first.partnerId);
          if (firstPartner) {
            setActiveUser(firstPartner);
            setActiveConversationKey(first.conversationKey);
          }
        }
      } catch (err) {
        console.error("Load conversations error:", err);
      }
    };
    load();
  }, [currentUserId]);

  // Load thông tin Project (tên + chủ project)
  const [projectsMap, setProjectsMap] = useState(new Map());

  useEffect(() => {
    const loadProjects = async () => {
      const ids = new Set();
      (conversations || []).forEach((c) => {
        const [pid] = String(c.conversationKey).split(":");
        if (pid && pid !== "null") ids.add(pid);
      });
      if (ids.size === 0) return;

      const newMap = new Map(projectsMap);
      for (const pid of ids) {
        if (newMap.has(pid)) continue;
        try {
          const res = await api.get(`api/projects/${pid}`);
          const proj = res.data || {};
          const title =
            proj.title || proj.name || proj.projectName || "(Không tên)";
          const owner =
            proj.ownerName ||
            proj.createdByName ||
            proj.owner?.fullName ||
            "(Chưa rõ)";
          newMap.set(pid, { title, owner });
        } catch {
          newMap.set(pid, { title: "(Không tìm thấy)", owner: "" });
        }
      }
      setProjectsMap(newMap);
    };

    loadProjects();
  }, [conversations]);

  const loadThread = useCallback(async (key, resetPagination = true) => {
    if (!key) return;
    try {
      const res = await api.get(`api/messages/thread/${key}`);
      const normalized = (res.data || []).map(normalizeMessage);

      // thêm xử lý fetch status + allow contract-id
      const enriched = await Promise.all(
        normalized.map(async (m) => {
          if (!isHtml(m.text)) return m;
          const safeHtml = DOMPurify.sanitize(m.text, {
            ALLOW_DATA_ATTR: true,
            ADD_ATTR: [
              "data-action",
              "data-proposal-id",
              "data-project-id",
              "data-status",
              "data-proposal-status",
              "data-contract-id", // ✅ để xem hợp đồng
            ],
          });
          const finalHtml = await withActionButtonsIfPending(
            safeHtml,
            currentUserId
          );
          return { ...m, finalHtml };
        })
      );

      // Sort by createdAt (oldest first)
      enriched.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateA - dateB;
      });

      setAllMessages(enriched);
      
      // Cập nhật conversations list với tin nhắn mới nhất từ thread
      if (enriched.length > 0 && key) {
        const lastMessage = enriched[enriched.length - 1];
        setConversations((prev) => {
          const updated = [...prev];
          const index = updated.findIndex((c) => c.conversationKey === key);
          
          if (index >= 0) {
            // Làm sạch text để hiển thị
            let displayText = lastMessage.text || "";
            if (isHtml(displayText)) {
              displayText = displayText.replace(/<[^>]*>/g, "").trim();
              if (displayText.length > 50) {
                displayText = displayText.substring(0, 50) + "...";
              }
            }
            
            // Chỉ cập nhật nếu tin nhắn mới hơn
            const currentLastAt = updated[index].lastAt 
              ? (updated[index].lastAt instanceof Date 
                  ? updated[index].lastAt.getTime() 
                  : new Date(updated[index].lastAt).getTime())
              : 0;
            const newLastAt = lastMessage.createdAt 
              ? new Date(lastMessage.createdAt).getTime() 
              : 0;
            
            if (newLastAt >= currentLastAt) {
              updated[index] = {
                ...updated[index],
                lastMessage: displayText,
                lastAt: lastMessage.createdAt,
              };
              
              // Sort lại
              updated.sort((a, b) => {
                const getTime = (date) => {
                  if (!date) return 0;
                  if (date instanceof Date) return date.getTime();
                  const parsed = new Date(date);
                  return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
                };
                return getTime(b.lastAt) - getTime(a.lastAt);
              });
            }
          }
          
          return updated;
        });
      }
      
      if (resetPagination) {
        // Hiển thị messages mới nhất (cuối cùng)
        setDisplayedMessagesCount(Math.min(MESSAGES_PER_PAGE, enriched.length));
      } else {
        // Khi không reset (từ SignalR), hiển thị tất cả messages mới nhất
        // Đảm bảo tin nhắn mới luôn được hiển thị
        setDisplayedMessagesCount(enriched.length);
      }
    } catch (err) {
      console.error("Load thread error:", err);
    }
  }, [currentUserId]);

  // 🔗 SignalR connection for real-time messages
  useEffect(() => {
    if (!currentUserId) return;

    const token =
      localStorage.getItem("token") ||
      sessionStorage.getItem("token") ||
      localStorage.getItem("accessToken");

    if (!token) {
      console.warn("⚠️ No token found, cannot connect SignalR MessageHub");
      return;
    }

    // Detect production: check if not localhost
    const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
    // SignalR cần kết nối trực tiếp đến backend Azure (không qua Vercel proxy vì WebSocket không được proxy)
    const API_BASE = import.meta.env.VITE_API_URL 
      ? import.meta.env.VITE_API_URL.replace(/\/api\/?$/, "")
      : isProduction
        ? "https://lanserve-api-cgfghcd9bshbazbd.malaysiawest-01.azurewebsites.net"
        : "http://localhost:5070";
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${API_BASE}/hubs/message`, {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    // Lắng nghe tin nhắn mới
    connection.on("ReceiveMessage", async (message) => {
      console.log("📩 [SignalR] New message received:", message);
      
      const normalizedMsg = normalizeMessage(message);
      
      // Xử lý HTML nếu là proposal message
      let finalMsg = normalizedMsg;
      if (isHtml(normalizedMsg.text)) {
        try {
          const safeHtml = DOMPurify.sanitize(normalizedMsg.text, {
            ALLOW_DATA_ATTR: true,
            ADD_ATTR: [
              "data-action",
              "data-proposal-id",
              "data-project-id",
              "data-status",
              "data-proposal-status",
              "data-contract-id",
            ],
          });
          const finalHtml = await withActionButtonsIfPending(
            safeHtml,
            currentUserId
          );
          finalMsg = { ...normalizedMsg, finalHtml };
        } catch (err) {
          console.error("Error processing HTML message:", err);
        }
      }
      
      // Nếu đang ở conversation này, thêm tin nhắn vào danh sách ngay lập tức
      if (finalMsg.conversationKey === activeConversationKey) {
        console.log("📩 [SignalR] Adding message to active conversation:", finalMsg.id);
        
        // Thêm tin nhắn vào danh sách ngay lập tức
        setAllMessages((prev) => {
          // Kiểm tra xem tin nhắn đã tồn tại chưa (tránh duplicate)
          const exists = prev.some((m) => m.id === finalMsg.id);
          if (exists) {
            console.log("📩 [SignalR] Message already exists, skipping");
            return prev;
          }
          
          // Thêm tin nhắn mới và sort lại
          const updated = [...prev, finalMsg];
          updated.sort((a, b) => {
            const dateA = new Date(a.createdAt || 0).getTime();
            const dateB = new Date(b.createdAt || 0).getTime();
            return dateA - dateB;
          });
          
          console.log("📩 [SignalR] Message added. Total messages:", updated.length);
          
          // Tự động tăng số lượng hiển thị để hiển thị tin nhắn mới
          setDisplayedMessagesCount((count) => {
            const newCount = Math.min(count + 1, updated.length);
            console.log("📩 [SignalR] Updated displayed count:", newCount);
            return newCount;
          });
          
          return updated;
        });
        
        // Auto-scroll xuống cuối sau khi thêm tin nhắn
        setTimeout(() => {
          if (autoStick && containerRef.current) {
            containerRef.current.scrollTop = containerRef.current.scrollHeight;
          }
        }, 100);
        
        // Reload thread để đảm bảo sync với server (sau khi đã thêm tin nhắn vào UI)
        loadThread(activeConversationKey, false)
          .then(() => {
            console.log("📩 [SignalR] Thread reloaded after receiving message");
            // Auto-scroll lại sau khi reload
            if (autoStick && containerRef.current) {
              setTimeout(() => {
                if (containerRef.current) {
                  containerRef.current.scrollTop = containerRef.current.scrollHeight;
                }
              }, 200);
            }
          })
          .catch((err) => console.error("Error reloading thread:", err));
      }
      
      // Cập nhật conversations list (để hiển thị tin nhắn mới nhất)
      setConversations((prev) => {
        const updated = [...prev];
        const convKey = finalMsg.conversationKey;
        const index = updated.findIndex((c) => c.conversationKey === convKey);
        
        // Làm sạch text để hiển thị (loại bỏ HTML tags)
        let displayText = finalMsg.text || "";
        if (isHtml(displayText)) {
          // Loại bỏ HTML tags cơ bản
          displayText = displayText.replace(/<[^>]*>/g, "").trim();
          // Giới hạn độ dài
          if (displayText.length > 50) {
            displayText = displayText.substring(0, 50) + "...";
          }
        }
        
        if (index >= 0) {
          // Cập nhật conversation hiện có
          const isReceiver = finalMsg.receiverId === currentUserId;
          const isCurrentConversation = convKey === activeConversationKey;
          
          // Chỉ tăng unreadCount nếu:
          // - User là người nhận
          // - Tin nhắn chưa đọc
          // - Không phải conversation đang xem (nếu đang xem thì đã đọc rồi)
          const shouldIncreaseUnread = isReceiver && !finalMsg.isRead && !isCurrentConversation;
          
          updated[index] = {
            ...updated[index],
            lastMessage: displayText,
            lastAt: finalMsg.createdAt,
            unreadCount: shouldIncreaseUnread
              ? (updated[index].unreadCount || 0) + 1
              : updated[index].unreadCount || 0,
          };
        } else {
          // Thêm conversation mới nếu chưa có
          const { projectId, receiverId, senderId } = parseKey(convKey);
          const partnerId = finalMsg.senderId === currentUserId 
            ? finalMsg.receiverId 
            : finalMsg.senderId;
          
          updated.push({
            conversationKey: convKey,
            partnerId: partnerId,
            lastMessage: displayText,
            lastAt: finalMsg.createdAt,
            unreadCount: finalMsg.receiverId === currentUserId && !finalMsg.isRead ? 1 : 0,
          });
          
          // Load thông tin user nếu chưa có
          if (!usersMap.has(partnerId)) {
            api.get(`api/users/${partnerId}`).then((res) => {
              const user = res.data;
              if (user) {
                setUsersMap((prev) => new Map(prev).set(partnerId, user));
              }
            }).catch(() => {});
          }
          
          // Load thông tin project nếu chưa có
          if (projectId && projectId !== "null" && !projectsMap.has(projectId)) {
            api.get(`api/projects/${projectId}`).then((res) => {
              const proj = res.data || {};
              const title = proj.title || proj.name || proj.projectName || "(Không tên)";
              const owner = proj.ownerName || proj.createdByName || proj.owner?.fullName || "(Chưa rõ)";
              setProjectsMap((prev) => new Map(prev).set(projectId, { title, owner }));
            }).catch(() => {});
          }
        }
        
        // Sắp xếp lại: conversation có tin nhắn mới nhất lên đầu
        // Đảm bảo lastAt được parse đúng (có thể là string hoặc Date)
        updated.sort((a, b) => {
          const getTime = (date) => {
            if (!date) return 0;
            if (date instanceof Date) return date.getTime();
            const parsed = new Date(date);
            return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
          };
          
          const dateA = getTime(a.lastAt);
          const dateB = getTime(b.lastAt);
          
          // Sort: mới nhất lên đầu (dateB - dateA)
          return dateB - dateA;
        });
        
        console.log("🔄 [SignalR] Conversations sorted. First conversation:", updated[0]?.conversationKey, updated[0]?.lastAt);
        
        return updated;
      });
    });

    connection
      .start()
      .then(() => {
        console.log("✅ Connected to SignalR MessageHub");
        messageHubRef.current = connection;
      })
      .catch((err) => {
        console.error("❌ Error connecting SignalR MessageHub:", err);
        console.warn("⚠️ SignalR MessageHub không kết nối được. Tin nhắn sẽ không tự động load real-time.");
        console.warn("⚠️ Vui lòng restart backend để load MessageHub mới.");
      });

    return () => {
      if (connection) {
        connection.stop().catch((err) => {
          console.error("Error stopping SignalR connection:", err);
        });
      }
    };
  }, [currentUserId, activeConversationKey, autoStick, loadThread]);

  useEffect(() => {
    if (!activeConversationKey || !currentUserId) {
      setAllMessages([]);
      setMessages([]);
      return;
    }
    
    // Mark tất cả tin nhắn trong conversation là đã đọc khi mở
    const markAsRead = async () => {
      try {
        // URL encode conversationKey vì nó có dấu `:`
        const encodedKey = encodeURIComponent(activeConversationKey);
        await api.post(`api/messages/conversation/${encodedKey}/read-all`);
        // Cập nhật isRead cho tất cả messages trong state
        setAllMessages((prev) =>
          prev.map((m) => {
            if (m.receiverId === currentUserId && !m.isRead) {
              return { ...m, isRead: true };
            }
            return m;
          })
        );
        // Reset unreadCount trong conversations
        setConversations((prev) => {
          const updated = [...prev];
          const index = updated.findIndex(
            (c) => c.conversationKey === activeConversationKey
          );
          if (index >= 0) {
            updated[index] = {
              ...updated[index],
              unreadCount: 0,
            };
          }
          return updated;
        });
      } catch (err) {
        console.error("Error marking messages as read:", err);
      }
    };
    
    loadThread(activeConversationKey, true)
      .then(() => markAsRead())
      .catch((err) => console.error("Messages error:", err.message));
  }, [activeConversationKey, currentUserId, loadThread]);

  // Displayed messages (lấy từ cuối mảng, messages mới nhất)
  const displayedMessages = useMemo(() => {
    if (allMessages.length === 0) return [];
    // Lấy messages từ cuối lên (messages mới nhất)
    const startIndex = Math.max(0, allMessages.length - displayedMessagesCount);
    return allMessages.slice(startIndex);
  }, [allMessages, displayedMessagesCount]);

  // Update messages state when displayedMessages changes
  useEffect(() => {
    setMessages(displayedMessages);
  }, [displayedMessages]);

  // Event delegation: click trong HTML
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const onClick = async (e) => {
      const btn = e.target.closest?.("button[data-action]");
      if (!btn || !root.contains(btn)) return;

      // Có card thì lấy, không có thì vẫn xử lý nút
      const card = btn.closest(".proposal-card");

      const action = btn.getAttribute("data-action");
      const proposalId = card?.getAttribute("data-proposal-id");
      const projectId = card?.getAttribute("data-project-id");

      // Một số nút (view-contract) không cần proposalId
      if (!action) return;

      // ✏️ Chỉnh sửa giá đề xuất
      if (action === "edit") {
        if (!proposalId) return;
        setEditingProposalId(proposalId);
        setEditingProjectId(projectId || null);
        setNewPrice("");
        setShowEditModal(true);
        return;
      }

      // ❌ Hủy đề xuất (popup xác nhận)
      if (action === "cancel") {
        if (!proposalId) return;
        if (!confirm("Bạn có chắc muốn hủy đề xuất này không?")) return;
        try {
          btn.disabled = true;
          await api.post(`api/Proposals/${proposalId}/cancel`, { projectId }); // ✅ viết hoa + gửi projectId
          await loadThread(activeConversationKey);
        } catch (err) {
          console.error("Cancel proposal error:", err.message);
        } finally {
          btn.disabled = false;
        }
        return;
      }

      // ✅ Đồng ý đề xuất (tạo contract + message nhúng mới)
      if (action === "accept") {
        if (!proposalId) return;
        try {
          btn.disabled = true;
          console.log(
            "Accepting proposal:",
            proposalId,
            "for project:",
            projectId
          );

          // 1️⃣ Lấy giá đề xuất hiện tại
          const amount = await getProposalAmount(proposalId);
          if (!Number.isFinite(amount) || amount <= 0) {
            alert("Giá đề xuất không hợp lệ hoặc không tìm thấy.");
            return;
          }

          // 2️⃣ Lấy số dư ví của current user
          if (!currentUserId) {
            alert("Không xác định được người dùng hiện tại.");
            return;
          }
          const balance = await getMyWalletBalance(currentUserId);

          // 3️⃣ Kiểm tra đủ tiền
          if (balance < amount) {
            const need = (amount - balance).toLocaleString();
            alert(`Số dư ví không đủ để đồng ý đề xuất.\nThiếu: ${need} đ`);
            return; // ❌ dừng lại
          }

          // 4️⃣ Đủ tiền → trừ ví trước
          const note = `Withdraw for accepted proposal #${proposalId}`;
          try {
            await api.post("/api/wallets/change-balance", {
              Delta: -Math.abs(amount),
              Note: note,
            });
            console.log(`💸 Đã trừ ${amount.toLocaleString()}đ từ ví.`);
          } catch (err) {
            console.error("Withdraw failed:", err);
            alert("Không thể trừ tiền từ ví, vui lòng thử lại sau.");
            return;
          }

          // 5️⃣ Sau khi trừ tiền thành công → Gọi accept
          await api.post(`api/Proposals/${proposalId}/accept`, { projectId });
          await loadThread(activeConversationKey); // reload thread để thấy message mới
          alert("Đồng ý đề xuất thành công!");
        } catch (err) {
          console.error("Accept proposal error:", err?.message || err);
          alert(
            err?.response?.data?.detail ||
              err?.response?.data?.message ||
              "Không thể chấp nhận đề xuất này."
          );
        } finally {
          btn.disabled = false;
        }
        return;
      }

      // 📄 Xem hợp đồng (hiện popup)
      if (action === "view-contract") {
        const contractId =
          btn.getAttribute("data-contract-id") ||
          card?.getAttribute("data-contract-id"); // fallback
        if (!contractId) return;
        try {
          btn.disabled = true;
          const res = await api.get(`api/Contracts/${contractId}`); // ✅ viết hoa Contracts
          setContractData(res.data || {});
          setShowContractModal(true);
        } catch (err) {
          console.error("View contract error:", err.message);
          alert("Không tải được thông tin hợp đồng.");
        } finally {
          btn.disabled = false;
        }
        return;
      }
    };

    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [containerRef, currentUserId, activeConversationKey]);

  const sendMessage = async () => {
    if (!text.trim() || !activeUser || !currentUserId) return;
    
    // Lưu text trước khi clear
    const messageText = text.trim();
    
    try {
      const { projectId } = parseKey(activeConversationKey || "");
      const payload = {
        receiverId: activeUser.id || activeUser._id || activeUser.userId,
        text: messageText,
        projectId: projectId && projectId !== "null" ? projectId : null,
      };
      console.log("📤 [Messages.jsx] Sending message:", payload);
      const res = await api.post("api/messages", payload);
      console.log("✅ [Messages.jsx] Message sent successfully:", res.data);
      
      // Clear text ngay để UI responsive
      setText("");
      
      // Cập nhật conversations list ngay lập tức với tin nhắn vừa gửi
      const sentMessage = res.data;
      if (sentMessage && activeConversationKey) {
        setConversations((prev) => {
          const updated = [...prev];
          const index = updated.findIndex(
            (c) => c.conversationKey === activeConversationKey
          );
          
          if (index >= 0) {
            // Làm sạch text để hiển thị
            let displayText = messageText || "";
            if (isHtml(displayText)) {
              displayText = displayText.replace(/<[^>]*>/g, "").trim();
              if (displayText.length > 50) {
                displayText = displayText.substring(0, 50) + "...";
              }
            }
            
            const messageTime = sentMessage.createdAt || new Date().toISOString();
            
            updated[index] = {
              ...updated[index],
              lastMessage: displayText,
              lastAt: messageTime,
            };
            
            // Sort lại: conversation mới nhất lên đầu
            updated.sort((a, b) => {
              const getTime = (date) => {
                if (!date) return 0;
                if (date instanceof Date) return date.getTime();
                const parsed = new Date(date);
                return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
              };
              return getTime(b.lastAt) - getTime(a.lastAt);
            });
            
            console.log("🔄 [sendMessage] Updated conversation:", updated[index].conversationKey, "lastMessage:", displayText);
          }
          
          return updated;
        });
      }
      
      // Reload thread to get updated messages (including the new one)
      // loadThread sẽ tự động cập nhật conversations list với tin nhắn mới nhất từ thread
      await loadThread(activeConversationKey, false);
    } catch (err) {
      console.error("Send message error:", err.message);
    }
  };
  async function payoutToFreelancer(freelancerId, amount, contractId) {
    const amt = Number(amount) || 0;
    if (amt <= 0) throw new Error("Invalid payout amount");
    const payload = {
      toUserId: freelancerId,
      amount: Math.abs(amt),
      contractId,
      note: `Payout for contract #${contractId}`,
    };
    // BE phải có endpoint này (ở dưới)
    const res = await api.post("/api/wallets/payout", payload);
    return res.data;
  }

  const submitEdit = async () => {
    const n = Number(newPrice);
    if (!editingProposalId) return;
    if (!Number.isFinite(n) || n <= 0) {
      alert("Giá không hợp lệ");
      return;
    }

    try {
      setEditLoading(true);
      const res = await handleProposalEdit(editingProposalId, n);
      const updated = res?.proposal || {};
      const pid = updated.id || updated.Id || editingProposalId;
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          senderId: "system",
          receiverId: currentUserId,
          text: `Đã cập nhật giá đề xuất #${pid} → ${n.toLocaleString()}`,
          createdAt: new Date().toISOString(),
          isRead: true,
        },
      ]);
      setShowEditModal(false);
      setEditingProposalId(null);
      setNewPrice("");
      await loadThread(activeConversationKey);
    } catch (err) {
      alert(`Chỉnh sửa thất bại: ${err.message}`);
    } finally {
      setEditLoading(false);
    }
  };

  // Sidebar
  const sidebarItems = useMemo(() => {
    const items = (conversations || []).map((c) => {
      const partner = usersMap.get(c.partnerId) || {};
      const [projectId] = String(c.conversationKey).split(":");
      const pInfo = projectsMap.get(projectId) || {};
      const projectName = pInfo.title || "Đang tải...";
      const partnerName = partner.fullName || partner.email || c.partnerId;

      // Parse lastAt đúng cách
      let lastAtDate = null;
      if (c.lastAt) {
        if (c.lastAt instanceof Date) {
          lastAtDate = c.lastAt;
        } else {
          const parsed = new Date(c.lastAt);
          lastAtDate = isNaN(parsed.getTime()) ? null : parsed;
        }
      }

      return {
        conversationKey: c.conversationKey,
        partnerId: c.partnerId,
        projectId,
        projectName,
        partnerName,
        lastMessage: c.lastMessage || "",
        lastAt: lastAtDate,
        unreadCount: c.unreadCount || 0,
        userObj: partner,
      };
    });
    
    // Đảm bảo sort lại theo lastAt (mới nhất lên đầu)
    items.sort((a, b) => {
      const timeA = a.lastAt ? a.lastAt.getTime() : 0;
      const timeB = b.lastAt ? b.lastAt.getTime() : 0;
      return timeB - timeA; // Mới nhất lên đầu
    });
    
    return items;
  }, [conversations, usersMap, projectsMap]);

  // Displayed conversations (for pagination)
  const displayedSidebarItems = useMemo(() => {
    return sidebarItems.slice(0, displayedConversationsCount);
  }, [sidebarItems, displayedConversationsCount]);

  // Infinite scroll for conversations
  useEffect(() => {
    const handleScroll = () => {
      if (isLoadingMoreConversations) return;
      if (displayedConversationsCount >= sidebarItems.length) return;

      const container = conversationsContainerRef.current;
      if (!container) return;

      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;

      // Load more when 100px from bottom
      if (scrollTop + clientHeight >= scrollHeight - 100) {
        setIsLoadingMoreConversations(true);
        setTimeout(() => {
          setDisplayedConversationsCount(prev => Math.min(prev + CONVERSATIONS_PER_PAGE, sidebarItems.length));
          setIsLoadingMoreConversations(false);
        }, 300);
      }
    };

    const container = conversationsContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [isLoadingMoreConversations, displayedConversationsCount, sidebarItems.length]);

  // Reset displayed count when conversations change
  useEffect(() => {
    setDisplayedConversationsCount(CONVERSATIONS_PER_PAGE);
  }, [conversations.length]);

  if (loading) return (
    <div className="p-4 flex items-center justify-center gap-3">
      <Spinner />
      <span>Đang tải...</span>
    </div>
  );

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1 card p-4 flex flex-col">
        <div className="font-semibold mb-3">Đoạn chat</div>
        <div 
          ref={conversationsContainerRef}
          className="flex-1 overflow-y-auto"
          style={{ maxHeight: '600px' }}
        >
          {displayedSidebarItems.map((it) => (
          <div
            key={it.conversationKey}
            onClick={async () => {
              setActiveUser(it.userObj);
              setActiveConversationKey(it.conversationKey);
              setMessages([]);
              setAllMessages([]);
              setDisplayedMessagesCount(MESSAGES_PER_PAGE);
              
              // Mark tất cả tin nhắn trong conversation là đã đọc
              if (it.unreadCount > 0) {
                try {
                  // URL encode conversationKey vì nó có dấu `:`
                  const encodedKey = encodeURIComponent(it.conversationKey);
                  await api.post(`api/messages/conversation/${encodedKey}/read-all`);
                  // Reset unreadCount khi mở conversation
                  setConversations((prev) => {
                    const updated = [...prev];
                    const index = updated.findIndex(
                      (c) => c.conversationKey === it.conversationKey
                    );
                    if (index >= 0) {
                      updated[index] = {
                        ...updated[index],
                        unreadCount: 0,
                      };
                    }
                    return updated;
                  });
                } catch (err) {
                  console.error("Error marking messages as read:", err);
                }
              }
            }}
            className={`cursor-pointer px-3 py-2.5 rounded-lg transition-colors duration-150 flex items-center gap-3 ${
              activeConversationKey === it.conversationKey
                ? "bg-blue-100"
                : it.unreadCount > 0
                ? "bg-blue-50 hover:bg-blue-100"
                : "hover:bg-gray-100"
            }`}
          >
            {/* Avatar */}
            <div className="shrink-0">
              {it.userObj?.avatarUrl ? (
                <img
                  src={it.userObj.avatarUrl}
                  alt={it.partnerName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold text-lg">
                  {(it.partnerName || "U")[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0 flex flex-col gap-0.5">
              <div className="flex items-center justify-between gap-2">
                <div className={`truncate ${it.unreadCount > 0 ? "font-semibold" : "font-medium"} text-sm`}>
                  {it.projectName}
                </div>
                {it.lastAt && (
                  <div className="text-xs text-gray-500 shrink-0">
                    {(() => {
                      const diffMs = Date.now() - it.lastAt.getTime();
                      const diffHours = diffMs / (1000 * 60 * 60);

                      if (diffHours < 1) {
                        const diffMins = Math.floor(diffMs / (1000 * 60));
                        return diffMins < 1 ? "Vừa xong" : `${diffMins} phút`;
                      }

                      if (diffHours < 24) {
                        return it.lastAt.toLocaleTimeString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        });
                      }

                      const diffDays = Math.floor(diffHours / 24);
                      if (diffDays === 1) return "Hôm qua";
                      if (diffDays < 7) return `${diffDays} ngày trước`;
                      
                      return it.lastAt.toLocaleDateString("vi-VN", {
                        day: "2-digit",
                        month: "2-digit",
                      });
                    })()}
                  </div>
                )}
              </div>
              <div className="flex items-center justify-between gap-2">
                <div className={`truncate text-sm ${
                  it.unreadCount > 0 ? "text-gray-900 font-medium" : "text-gray-600"
                }`}>
                  {it.lastMessage || "Không có tin nhắn"}
                </div>
                {it.unreadCount > 0 && (
                  <span className="bg-blue-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center shrink-0">
                    {it.unreadCount > 10 ? "10+" : it.unreadCount}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Loading more conversations indicator */}
        {isLoadingMoreConversations && (
          <div className="flex items-center justify-center py-2">
            <Spinner size="sm" />
          </div>
        )}

        {/* End of conversations indicator */}
        {displayedConversationsCount >= sidebarItems.length && sidebarItems.length > 0 && (
          <div className="text-center py-2 text-slate-500 text-xs">
            Đã hiển thị tất cả {sidebarItems.length} đoạn chat
          </div>
        )}
        </div>
      </div>

      {/* Chat */}
      <div className="lg:col-span-2 card p-4 flex flex-col">
        {activeUser ? (
          <>
            <div className="font-semibold mb-3">
              Đang chat với {activeUser.fullName || activeUser.email}
            </div>
            <div className="border rounded-lg bg-slate-50 p-4 h-[400px] flex flex-col">
              <div
                ref={containerRef}
                onScroll={onScroll}
                className="flex-1 overflow-y-auto space-y-3"
              >
                {/* Loading more messages indicator at top */}
                {isLoadingMoreMessages && (
                  <div className="flex items-center justify-center py-2">
                    <Spinner size="sm" />
                    <span className="ml-2 text-sm text-slate-500">Đang tải tin nhắn cũ hơn...</span>
                  </div>
                )}

                {/* Show message when all messages are loaded */}
                {!isLoadingMoreMessages && displayedMessagesCount >= allMessages.length && allMessages.length > MESSAGES_PER_PAGE && (
                  <div className="text-center py-2 text-slate-500 text-xs">
                    Đã hiển thị tất cả tin nhắn
                  </div>
                )}

                {messages.length === 0 ? (
                  <EmptyState title="Chưa có tin nhắn nào" />
                ) : (
                  messages.map((m) => {
                    const isMine = m.senderId === currentUserId;
                    const showHtml = isHtml(m.text);
                    // Kiểm tra tin nhắn chưa đọc (chỉ hiển thị cho tin nhắn người khác gửi)
                    const isUnread = !isMine && !m.isRead;
                    
                    return (
                      <div
                        key={m.id}
                        className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-md border ${
                          isMine
                            ? "ml-auto border-brand-200 bg-white"
                            : isUnread
                            ? "mr-auto border-blue-500 bg-blue-100 font-medium"
                            : "mr-auto border-slate-200 bg-white"
                        }`}
                      >
                        {showHtml ? (
                          <div
                            dangerouslySetInnerHTML={{
                              __html: m.finalHtml || m.text,
                            }}
                          />
                        ) : (
                          m.text
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Input */}
            <div className="mt-3 flex gap-2">
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="input flex-1"
                placeholder="Nhập tin nhắn..."
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />
              <button className="btn btn-primary" onClick={sendMessage}>
                Gửi
              </button>
            </div>
          </>
        ) : (
          <EmptyState title="Chọn một đoạn chat để bắt đầu" />
        )}
      </div>

      {/* Modal chỉnh sửa */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-md">
            <h2 className="text-lg font-semibold mb-3">
              Chỉnh sửa giá đề xuất
            </h2>
            <input
              type="number"
              min="1"
              className="input w-full mb-3"
              placeholder="Nhập giá mới..."
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submitEdit()}
            />
            <div className="flex justify-end gap-2">
              <button
                className="btn btn-outline"
                onClick={() => setShowEditModal(false)}
              >
                Hủy
              </button>
              <button
                className="btn btn-primary"
                onClick={submitEdit}
                disabled={editLoading}
              >
                {editLoading ? "Đang lưu..." : "Lưu thay đổi"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ----- Modal: Confirm cancel (tuỳ chọn) ----- */}
      {confirmingCancel && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-xl w-full max-w-md">
            <h2 className="text-base font-semibold mb-2">Hủy đề xuất?</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              Thao tác này sẽ xóa thẻ đề xuất hiện tại và tạo một thông báo "Đã
              hủy" trong đoạn chat.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button
                className="btn"
                onClick={() => setConfirmingCancel(false)}
              >
                Không
              </button>
              <button
                className="btn btn-danger"
                onClick={async () => {
                  try {
                    await api.post(`api/Proposals/${cancelProposalId}/cancel`, {
                      projectId: null,
                    });
                    setConfirmingCancel(false);
                    setCancelProposalId("");
                    await loadThread(activeConversationKey);
                  } catch {
                    alert("Hủy đề xuất thất bại");
                  }
                }}
              >
                Đồng ý
              </button>
            </div>
          </div>
        </div>
      )}
      {/* ----- Modal: View contract ----- */}
      {showContractModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white text-black p-6 rounded-2xl shadow-xl w-full max-w-lg">
            <h2 className="text-base font-semibold mb-4">Thông tin hợp đồng</h2>
            <div className="space-y-2 text-sm">
              <div>
                <b>Mã hợp đồng:</b> {contractData?.id || contractData?._id}
              </div>
              <div>
                <b>Project:</b> {contractData?.projectId}
              </div>
              <div>
                <b>Client:</b> {contractData?.clientId}
              </div>
              <div>
                <b>Freelancer:</b> {contractData?.freelancerId}
              </div>
              <div>
                <b>Số tiền:</b>{" "}
                {Number(contractData?.agreedAmount || 0).toLocaleString()} đ
              </div>
              <div>
                <b>Trạng thái:</b> {contractData?.status}
              </div>
              <div>
                <b>Ngày tạo:</b>{" "}
                {contractData?.createdAt
                  ? new Date(contractData.createdAt).toLocaleString("vi-VN")
                  : ""}
              </div>
            </div>

            {/* 🔽 Đặt onClick ngay trong nút Xác nhận hoàn thành này */}
            <div className="flex justify-end gap-2 mt-5">
              {currentUserId &&
                contractData?.clientId === currentUserId &&
                contractData?.status === "Active" && (
                  <button
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-60"
                    disabled={payoutLoading}
                    onClick={async () => {
                      // 👉 Đây chính là đoạn onClick bạn hỏi
                      if (
                        !confirm(
                          "Xác nhận hoàn thành dự án và chuyển tiền cho freelancer?"
                        )
                      )
                        return;
                      try {
                        setPayoutLoading(true);

                        const amount = Number(contractData?.agreedAmount || 0);
                        const freelancerId = contractData?.freelancerId;
                        const contractId =
                          contractData?.id || contractData?._id;

                        if (
                          !freelancerId ||
                          !Number.isFinite(amount) ||
                          amount <= 0
                        ) {
                          alert("Thiếu thông tin để chuyển tiền.");
                          return;
                        }
                        if (contractData?.status !== "Active") {
                          alert("Hợp đồng không còn ở trạng thái Active.");
                          return;
                        }

                        // 1) 💸 Cộng tiền cho freelancer
                        await payoutToFreelancer(
                          freelancerId,
                          amount,
                          contractId
                        );

                        // 2) 📝 Cập nhật trạng thái hợp đồng thành Completed
                        try {
                          await api.put(`api/Contracts/${contractId}`, {
                            ...contractData,
                            status: "Completed",
                          });
                        } catch {
                          await api.put(`api/Contracts/${contractId}`, {
                            status: "Completed",
                          });
                        }

                        // 3) Cập nhật UI và gửi tin nhắn
                        setContractData((prev) => ({
                          ...prev,
                          status: "Completed",
                        }));
                        setMessages((prev) => [
                          ...prev,
                          {
                            id: crypto.randomUUID(),
                            senderId: "system",
                            receiverId: currentUserId,
                            text: `✅ Hợp đồng #${contractId} đã hoàn thành. Đã chuyển ${amount.toLocaleString()}đ cho freelancer.`,
                            createdAt: new Date().toISOString(),
                            isRead: true,
                          },
                        ]);

                        alert(
                          "Đã xác nhận hoàn thành và chuyển tiền cho freelancer."
                        );
                        setShowContractModal(false);
                      } catch (err) {
                        console.error("Payout/Complete error:", err);
                        alert(
                          err?.response?.data?.detail ||
                            err?.response?.data?.message ||
                            err?.message ||
                            "Không thể hoàn tất thanh toán."
                        );
                      } finally {
                        setPayoutLoading(false);
                      }
                    }}
                  >
                    {payoutLoading
                      ? "Đang chuyển..."
                      : "✅ Xác nhận hoàn thành"}
                  </button>
                )}

              <button
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition"
                onClick={() => setShowContractModal(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
