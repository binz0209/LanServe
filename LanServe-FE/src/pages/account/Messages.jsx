// src/pages/Messages.jsx
import { useEffect, useState, useRef, useMemo } from "react";
import { jwtDecode } from "jwt-decode";
import DOMPurify from "dompurify";
import api from "../../lib/api";
import EmptyState from "../../components/EmptyState";

// Helper: tách key thành projectId / receiverId / senderId
const parseKey = (key = "") => {
  const [projectId = "null", receiverId = "", senderId = ""] = String(key).split(":");
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
      return Number.isFinite(n) ? new Date(n).toISOString() : new Date(raw).toISOString();
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
    ownerId = res.data?.senderId || res.data?.freelancerId || res.data?.createdBy || null;
  } catch {
    console.warn(`[Proposal ${proposalId}] cannot fetch owner`);
  }

  const isOwner = ownerId && ownerId === currentUserId;

  const actions = document.createElement("div");
  actions.className = "actions flex gap-2 mt-2";

  actions.innerHTML = `
    ${!isOwner ? `<button data-action="accept" class="btn btn-sm btn-success">✅ Đồng ý</button>` : ""}
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

  const onScroll = () => {
    const el = containerRef.current;
    if (!el) return;
    const threshold = 40;
    const atBottom = el.scrollHeight - el.scrollTop - el.clientHeight <= threshold;
    setAutoStick(atBottom);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    if (autoStick) el.scrollTo({ top: el.scrollHeight, behavior: "auto" });
  }, [messages, activeUser, autoStick]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return setLoading(false);
    try {
      const decoded = jwtDecode(token);
      const id =
        decoded.sub ||
        decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
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
          const title = proj.title || proj.name || proj.projectName || "(Không tên)";
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

  const loadThread = async (key) => {
    if (!key) return;
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
        const finalHtml = await withActionButtonsIfPending(safeHtml, currentUserId);
        return { ...m, finalHtml };
      })
    );

    setMessages(enriched);
  };

  useEffect(() => {
    if (!activeConversationKey || !currentUserId) return;
    loadThread(activeConversationKey).catch((err) =>
      console.error("Messages error:", err.message)
    );
  }, [activeConversationKey, currentUserId]);

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
          console.log("Accepting proposal:", proposalId, "for project:", projectId);

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
    try {
      const { projectId } = parseKey(activeConversationKey || "");
      const res = await api.post("api/messages", {
        receiverId: activeUser.id || activeUser._id || activeUser.userId,
        text,
        projectId: projectId && projectId !== "null" ? projectId : null,
      });
      const saved = res.data || normalizeMessage({
        _id: { $oid: crypto.randomUUID() },
        conversationKey: activeConversationKey,
        senderId: currentUserId,
        receiverId: activeUser.id || activeUser._id || activeUser.userId,
        text,
        createdAt: { $date: Date.now() },
        isRead: true,
      });
      setMessages((prev) => [...prev, saved]);
      setText("");
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
    return (conversations || []).map((c) => {
      const partner = usersMap.get(c.partnerId) || {};
      const [projectId] = String(c.conversationKey).split(":");
      const pInfo = projectsMap.get(projectId) || {};
      const projectName = pInfo.title || "Đang tải...";
      const partnerName = partner.fullName || partner.email || c.partnerId;

      return {
        conversationKey: c.conversationKey,
        partnerId: c.partnerId,
        projectId,
        projectName,
        partnerName,
        lastMessage: c.lastMessage || "",
        lastAt: c.lastAt ? new Date(c.lastAt) : null,
        unreadCount: c.unreadCount || 0,
        userObj: partner,
      };
    });
  }, [conversations, usersMap, projectsMap]);

  if (loading) return <p className="p-4">Đang tải...</p>;

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Sidebar */}
      <div className="lg:col-span-1 card p-4">
        <div className="font-semibold mb-3">Đoạn chat</div>
        {sidebarItems.map((it) => (
          <div
            key={it.conversationKey}
            onClick={() => {
              setActiveUser(it.userObj);
              setActiveConversationKey(it.conversationKey);
              setMessages([]);
            }}
            className={`cursor-pointer p-3 rounded-xl border transition-colors duration-150 ${activeConversationKey === it.conversationKey
              ? "border-brand-700 bg-blue-100 text-blue-900"
              : "border-slate-200 hover:bg-slate-50 text-slate-700"
              }`}
          >
            <div className="font-medium truncate text-base">
              📁 <strong>{it.projectName}</strong>
              <span className="italic text-slate-500"> — {it.partnerName}</span>
              {it.lastAt && (
                <div className="text-xs text-slate-500 shrink-0">
                  {(() => {
                    const diffMs = Date.now() - it.lastAt.getTime();
                    const diffHours = diffMs / (1000 * 60 * 60);

                    if (diffHours < 24) {
                      return it.lastAt.toLocaleTimeString("vi-VN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: false,
                      }); // hh:mm
                    }

                    const diffDays = Math.floor(diffHours / 24);
                    return diffDays === 1
                      ? "1 ngày trước"
                      : `${diffDays} ngày trước`;
                  })()}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Chat */}
      <div className="lg:col-span-2 card p-4 flex flex-col">
        {activeUser ? (
          <>
            <div className="font-semibold mb-3">
              Đang chat với {activeUser.fullName || activeUser.email}
            </div>
            <div className="border rounded-lg bg-slate-50 p-4 h-[400px] flex flex-col">
              <div ref={containerRef} onScroll={onScroll} className="flex-1 overflow-y-auto space-y-3">
                {messages.length === 0 ? (
                  <EmptyState title="Chưa có tin nhắn nào" />
                ) : (
                  messages.map((m) => {
                    const isMine = m.senderId === currentUserId;
                    const showHtml = isHtml(m.text);
                    return (
                      <div
                        key={m.id}
                        className={`max-w-[70%] px-4 py-2 rounded-2xl shadow-md border ${isMine ? "ml-auto border-brand-200" : "mr-auto border-slate-200"
                          }`}
                      >
                        {showHtml ? (
                          <div dangerouslySetInnerHTML={{ __html: m.finalHtml || m.text }} />
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
            <h2 className="text-lg font-semibold mb-3">Chỉnh sửa giá đề xuất</h2>
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
              <button className="btn btn-outline" onClick={() => setShowEditModal(false)}>
                Hủy
              </button>
              <button className="btn btn-primary" onClick={submitEdit} disabled={editLoading}>
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
              Thao tác này sẽ xóa thẻ đề xuất hiện tại và tạo một thông báo "Đã hủy" trong đoạn chat.
            </p>
            <div className="flex justify-end gap-2 mt-5">
              <button className="btn" onClick={() => setConfirmingCancel(false)}>Không</button>
              <button
                className="btn btn-danger"
                onClick={async () => {
                  try {
                    await api.post(`api/Proposals/${cancelProposalId}/cancel`, { projectId: null });
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
              <div><b>Mã hợp đồng:</b> {contractData?.id || contractData?._id}</div>
              <div><b>Project:</b> {contractData?.projectId}</div>
              <div><b>Client:</b> {contractData?.clientId}</div>
              <div><b>Freelancer:</b> {contractData?.freelancerId}</div>
              <div><b>Số tiền:</b> {Number(contractData?.agreedAmount || 0).toLocaleString()} đ</div>
              <div><b>Trạng thái:</b> {contractData?.status}</div>
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
                      if (!confirm("Xác nhận hoàn thành dự án và chuyển tiền cho freelancer?")) return;
                      try {
                        setPayoutLoading(true);

                        const amount = Number(contractData?.agreedAmount || 0);
                        const freelancerId = contractData?.freelancerId;
                        const contractId = contractData?.id || contractData?._id;

                        if (!freelancerId || !Number.isFinite(amount) || amount <= 0) {
                          alert("Thiếu thông tin để chuyển tiền.");
                          return;
                        }
                        if (contractData?.status !== "Active") {
                          alert("Hợp đồng không còn ở trạng thái Active.");
                          return;
                        }

                        // 1) 💸 Cộng tiền cho freelancer
                        await payoutToFreelancer(freelancerId, amount, contractId);

                        // 2) 📝 Cập nhật trạng thái hợp đồng thành Completed
                        try {
                          await api.put(`api/Contracts/${contractId}`, {
                            ...contractData,
                            status: "Completed",
                          });
                        } catch {
                          await api.put(`api/Contracts/${contractId}`, { status: "Completed" });
                        }

                        // 3) Cập nhật UI và gửi tin nhắn
                        setContractData((prev) => ({ ...prev, status: "Completed" }));
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

                        alert("Đã xác nhận hoàn thành và chuyển tiền cho freelancer.");
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
                    {payoutLoading ? "Đang chuyển..." : "✅ Xác nhận hoàn thành"}
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
