// src/pages/Projects.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import SearchBar from "../../components/SearchBar";
import StatCard from "../../components/StatCard";
import Progress from "../../components/ui/progress";
import Button from "../../components/ui/button";
import axios from "../../lib/axios";
import { jwtDecode } from "jwt-decode";

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [statsBase, setStatsBase] = useState([]);
  const [categories, setCategories] = useState([]);
  const [skills, setSkills] = useState([]);              // skills từ DB
  const [currentUserId, setCurrentUserId] = useState(null);

  const [editing, setEditing] = useState(null);          // { ...project, skillIds: [] } | null
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const [activeFilter, setActiveFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const [filterCategory, setFilterCategory] = useState("");
  const [searchText, setSearchText] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");

  const [viewing, setViewing] = useState(null);

  const [confirmJob, setConfirmJob] = useState(null);

  const [currentUserName, setCurrentUserName] = useState("");
  // ===== current user =====
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const dec = jwtDecode(token);
      const id =
        dec.sub ||
        dec["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        dec.userId ||
        null;
      const name =
        dec.name ||
        dec.username ||
        dec.unique_name ||
        dec.preferred_username ||
        dec.email || // fallback email
        null;
      setCurrentUserId(id);
      setCurrentUserName(name);
    } catch (e) {
      console.error("Decode token error:", e);
    }
  }, []);

  // ====== filter client-side theo search + category ======
  const filteredProjects = useMemo(() => {
    const getTime = (p) => {
      const t = new Date(p.createdAt || p.updatedAt || 0).getTime();
      return Number.isFinite(t) ? t : 0;
    };

    const list = projects.filter((p) => {
      if (filterCategory && p.categoryId !== filterCategory) return false;

      if (searchText.trim()) {
        const txt = removeDiacritics(searchText);
        const title = removeDiacritics(p.title || "");
        const desc = removeDiacritics(p.description || "");
        if (!title.includes(txt) && !desc.includes(txt)) return false;
      }
      return true;
    });

    // sort by date
    return list.sort((a, b) =>
      sortOrder === "newest" ? getTime(b) - getTime(a) : getTime(a) - getTime(b)
    );
  }, [projects, filterCategory, searchText, sortOrder]);



  function removeDiacritics(str) {
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase();
  }

  // ===== categories & skills =====
  useEffect(() => {
    axios.get("categories").then(r => setCategories(r.data || [])).catch(e => console.error(e));
    axios.get("skills").then(r => setSkills(r.data || [])).catch(e => console.error("Skills error:", e));
  }, []);

  // ===== stats base (ALL) =====
  useEffect(() => {
    axios.get("projects")
      .then(res => setStatsBase(res.data || []))
      .catch(err => console.error("Load all projects for stats error:", err));
  }, []);

  // ===== load theo filter =====
  useEffect(() => {
    setLoading(true);
    let req;
    if (activeFilter === "ALL") req = axios.get("projects");
    else if (activeFilter === "Open") req = axios.get("projects/open");
    else req = axios.get(`projects/status/${activeFilter}`);

    req.then(res => setProjects(res.data || []))
      .catch(err => console.error("Load projects error:", err))
      .finally(() => setLoading(false));
  }, [activeFilter]);

  const catName = useCallback(
    (id) => categories.find((c) => c.id === id)?.name || "Khác",
    [categories]
  );

  // map skillIds -> names
  const skillNameMap = useMemo(() => {
    const map = new Map();
    for (const s of skills) map.set(s.id, s.name);
    return map;
  }, [skills]);

  const namesFromIds = useCallback(
    (ids = []) => ids.map((id) => skillNameMap.get(id)).filter(Boolean),
    [skillNameMap]
  );

  const startEdit = (p) => {
    if (p.ownerId !== currentUserId) return; // chỉ owner được sửa
    setErrors({});
    setApiError("");

    // chuẩn hoá skillIds từ project
    let skillIds = Array.isArray(p.skillIds) ? p.skillIds : [];
    if (!skillIds.length && Array.isArray(p.skillNames) && skills.length) {
      const nameToId = new Map(skills.map((s) => [s.name.toLowerCase(), s.id]));
      skillIds = p.skillNames
        .map((n) => nameToId.get((n || "").toLowerCase()))
        .filter(Boolean);
    }

    setEditing({
      id: p.id,
      ownerId: p.ownerId,
      title: p.title || "",
      description: p.description || "",
      budgetAmount: p.budgetAmount ?? 0,
      status: p.status || "Open",
      categoryId: p.categoryId || "",
      skillIds,
      createdAt: p.createdAt || null,
      updatedAt: p.updatedAt || null,
    });
  };

  // ➕ Tạo mới
  const startCreate = () => {
    if (!currentUserId) {
      alert("Bạn chưa đăng nhập!");
      return;
    }
    setErrors({});
    setApiError("");
    setEditing({
      id: null, // không có id -> save() sẽ POST
      ownerId: currentUserId,
      title: "",
      description: "",
      budgetAmount: 0,
      status: "Open",
      categoryId: "",
      skillIds: [],
      createdAt: null,
      updatedAt: null,
    });
  };

  const closeEdit = useCallback(() => setEditing(null), []);

  const validate = () => {
    const e = {};
    if (!editing.title?.trim()) e.title = "Vui lòng nhập tiêu đề";
    if (!editing.description?.trim()) e.description = "Vui lòng nhập mô tả";
    if (Number.isNaN(Number(editing.budgetAmount)) || Number(editing.budgetAmount) < 0) {
      e.budgetAmount = "Ngân sách không hợp lệ";
    }
    if (!editing.categoryId) e.categoryId = "Vui lòng chọn danh mục";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const save = async () => {
    if (!editing) return;
    if (!validate()) return;

    try {
      setSaving(true);
      setApiError("");

      let savedProject;

      if (!editing.id) {
        // ====== CREATE (POST) ======
        const payloadCreate = {
          ownerId: editing.ownerId,
          title: editing.title,
          description: editing.description,
          budgetAmount: Number(editing.budgetAmount),
          status: editing.status,
          categoryId: editing.categoryId,
        };
        const res = await axios.post("projects", payloadCreate); // POST /api/projects
        savedProject = res.data ?? payloadCreate;

        // đồng bộ skills
        if (Array.isArray(editing.skillIds)) {
          try {
            await axios.post("projectskills/sync", {
              projectId: editing.id || savedProject.id,
              skillIds: editing.skillIds || [],
            });

            // gán skillIds/skillNames vào chính project object để UI render
            savedProject.skillIds = editing.skillIds || [];
            savedProject.skillNames = namesFromIds(savedProject.skillIds);
          } catch (syncErr) {
            console.warn("Sync project skills warning:", syncErr?.response || syncErr);
          }

        }

        // cập nhật UI
        setProjects((prev) => [{ ...savedProject }, ...prev]);
        setStatsBase((prev) => [{ ...savedProject }, ...prev]);
      } else {
        // ====== UPDATE (PUT) ======
        const payloadUpdate = {
          id: editing.id,
          ownerId: editing.ownerId,
          title: editing.title,
          description: editing.description,
          budgetAmount: Number(editing.budgetAmount),
          status: editing.status,
          categoryId: editing.categoryId,
          updatedAt: new Date().toISOString(),
        };
        const res = await axios.put(`projects/${editing.id}`, payloadUpdate);
        savedProject = res.data ?? payloadUpdate;

        try {
          await axios.post("projectskills/sync", {
            projectId: editing.id,
            skillIds: editing.skillIds || [],
          });
          savedProject.skillIds = editing.skillIds || [];
          savedProject.skillNames = namesFromIds(savedProject.skillIds);
        } catch (syncErr) {
          console.warn("Sync project skills (update) warning:", syncErr?.response || syncErr);
        }

        setProjects((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...savedProject } : p)));
        setStatsBase((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...savedProject } : p)));
      }

      closeEdit();
    } catch (err) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data ||
        err?.message ||
        "Lưu thất bại";
      console.error("Save project error:", err?.response || err);
      setApiError(typeof msg === "string" ? msg : "Không lưu được thay đổi.");
    } finally {
      setSaving(false);
    }
  };

  // ===== View modal helpers =====
  const openView = (p) => {
    const isIds = Array.isArray(p.skillIds) && p.skillIds.length > 0;
    const resolvedSkills = isIds ? namesFromIds(p.skillIds) : (p.skillNames || []);
    setViewing({
      ...p,
      resolvedSkills,
      categoryName: catName(p.categoryId),
      isOwner: p.ownerId === currentUserId,
    });
  };
  const closeView = () => setViewing(null);

  const countOpen = statsBase.filter((p) => p.status === "Open").length;
  const countInProgress = statsBase.filter((p) => p.status === "InProgress").length;
  const countCompleted = statsBase.filter((p) => p.status === "Completed").length;
  const totalBudget =
    (statsBase.reduce((sum, p) => sum + (p.budgetAmount || 0), 0).toLocaleString("vi-VN") || "0") + " đ";

  return (
    <div className="container-ld py-8 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Dự án cần tuyển Freelancer</h1>
        <Button onClick={startCreate}>+ Dự án mới</Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <input
          type="text"
          className="input w-full md:w-1/2"
          placeholder="Tìm dự án theo tiêu đề hoặc mô tả..."
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />

        <div className="flex gap-3 w-full md:w-auto">
          {/* Filter theo danh mục */}
          <select
            className="select w-full md:w-auto"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">— Tất cả danh mục —</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* NEW: Sort theo ngày */}
          <select
            className="select w-full md:w-auto"
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
          >
            <option value="newest">Mới nhất</option>
            <option value="oldest">Cũ nhất</option>
          </select>
        </div>
      </div>

      {/* Filters clickable */}
      <div className="grid md:grid-cols-5 gap-4">
        <div role="button" onClick={() => setActiveFilter("ALL")} className={`transition rounded-xl ${activeFilter === "ALL" ? "ring-2 ring-brand-500" : ""}`}>
          <StatCard icon={"📦"} label="Tổng dự án" value={statsBase.length} />
        </div>
        <div role="button" onClick={() => setActiveFilter("Open")} className={`transition rounded-xl ${activeFilter === "Open" ? "ring-2 ring-brand-500" : ""}`}>
          <StatCard icon={"🟢"} label="Đang mở" value={countOpen} />
        </div>
        <div role="button" onClick={() => setActiveFilter("InProgress")} className={`transition rounded-xl ${activeFilter === "InProgress" ? "ring-2 ring-brand-500" : ""}`}>
          <StatCard icon={"⏳"} label="Đang thực hiện" value={countInProgress} />
        </div>
        <div role="button" onClick={() => setActiveFilter("Completed")} className={`transition rounded-xl ${activeFilter === "Completed" ? "ring-2 ring-brand-500" : ""}`}>
          <StatCard icon={"✅"} label="Hoàn thành" value={countCompleted} />
        </div>
        <StatCard icon={"💰"} label="Tổng ngân sách" value={totalBudget} />
      </div>

      {/* List */}
      {loading ? (
        <div className="card p-6">Đang tải dự án…</div>
      ) : filteredProjects.length === 0 ? (
        <div className="card p-6">Không có dự án phù hợp.</div>
      ) : (
        filteredProjects.map((p) => {
          const isOwner = p.ownerId === currentUserId;
          const shownSkills =
            Array.isArray(p.skillIds) && p.skillIds.length
              ? namesFromIds(p.skillIds)
              : (p.skillNames || []);
          return (
            <div key={p.id} className="card">
              <div className="card-body">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="text-lg font-semibold">{p.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{p.description}</div>
                    <div className="mt-2 flex gap-2 flex-wrap">
                      <span className="badge">{catName(p.categoryId)}</span>
                      {shownSkills.slice(0, 6).map((s) => (
                        <span key={s} className="badge badge-outline">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="text-right min-w-[140px]">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Ngân sách</div>
                    <div className="text-brand-700 font-semibold">
                      {p.budgetAmount?.toLocaleString("vi-VN") ?? "—"} đ
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span>Trạng thái:</span>
                    <span
                      className={`font-semibold ${p.status === "Open"
                        ? "text-green-600"
                        : p.status === "InProgress"
                          ? "text-blue-600"
                          : p.status === "Completed"
                            ? "text-gray-600"
                            : "text-red-600"
                        }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500">
                    Đăng lúc: {p.createdAt ? new Date(p.createdAt).toLocaleString("vi-VN") : "—"}
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" onClick={() => openView(p)}>Xem</Button>
                  {isOwner ? (
                    <Button variant="outline" onClick={() => startEdit(p)}>Chỉnh sửa</Button>
                  ) : (
                    p.status === "Open" && (
                      <Button
                        variant="outline"
                        onClick={() => setConfirmJob(p)}
                      >
                        Nhận job
                      </Button>
                    )
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      <div className="text-center">
        <Button variant="outline">Xem thêm dự án</Button>
      </div>
      {/* ===== Modal xác nhận nhận job ===== */}
      {confirmJob && (
        <>
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setConfirmJob(null)}
          />
          <div className="fixed left-1/2 top-1/2 z-50 w-[min(96vw,480px)] -translate-x-1/2 -translate-y-1/2">
            <div className="rounded-2xl bg-white shadow-2xl border border-slate-200">

              {/* Header */}
              <div className="p-4 border-b flex items-center justify-between">
                <div className="font-semibold">Ứng tuyển dự án</div>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => setConfirmJob(null)}
                >✕</button>
              </div>

              {/* Body */}
              <div className="p-5 space-y-4">
                <p>Bạn đang ứng tuyển vào dự án <b>{confirmJob.title}</b></p>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Cover Letter</label>
                  <textarea
                    className="textarea textarea-bordered w-full"
                    rows={3}
                    value={confirmJob.coverLetter || ""}
                    onChange={(e) =>
                      setConfirmJob({ ...confirmJob, coverLetter: e.target.value })
                    }
                    placeholder="Viết vài dòng giới thiệu về bạn..."
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Bid Amount</label>
                  <input
                    type="number"
                    className="input input-bordered w-full"
                    value={confirmJob.bidAmount || ""}
                    onChange={(e) =>
                      setConfirmJob({ ...confirmJob, bidAmount: e.target.value })
                    }
                    placeholder={`Theo budget của dự án: ${confirmJob.budgetAmount || "0"}$`}
                  />
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 border-t flex items-center justify-end gap-2">
                <Button variant="outline" onClick={() => setConfirmJob(null)}>Hủy</Button>
                <Button
                  onClick={async () => {
                    try {
                      const cover = (confirmJob.coverLetter || "").trim()
                        || "Tôi quan tâm đến dự án này và muốn ứng tuyển.";

                      // nếu bỏ trống bid -> theo budgetAmount của project
                      const numericBid = confirmJob.bidAmount === "" || confirmJob.bidAmount == null
                        ? (confirmJob.budgetAmount ?? null)
                        : Number(confirmJob.bidAmount);

                      const bid = Number.isFinite(numericBid) && numericBid > 0
                        ? numericBid
                        : (confirmJob.budgetAmount ?? null);

                      // 1) Tạo proposal
                      const proposalPayload = {
                        projectId: confirmJob.id || confirmJob._id,
                        freelancerId: currentUserId,
                        coverLetter: cover,
                        bidAmount: bid,         // có thể null -> BE hiểu là theo budget
                        status: "Pending",
                        createdAt: new Date().toISOString()
                      };
                      console.log("Proposal payload:", proposalPayload);

                      const { data: createdProposal } = await axios.post("proposals", proposalPayload);

                      // ID trả về có thể là id hoặc Id tuỳ config JSON
                      const createdProposalId = createdProposal?.id || createdProposal?.Id;

                      // 2) Tạo message “proposal”
                      const messagePayload = {
                        projectId: confirmJob.id || confirmJob._id,
                        proposalId: createdProposalId,
                        clientId: confirmJob.ownerId,
                        freelancerId: currentUserId,
                        projectTitle: confirmJob.title,
                        clientName: confirmJob.ownerName || "",       // nếu có
                        freelancerName: currentUserName || "",
                        coverLetter: cover,
                        bidAmount: bid
                      };
                      console.log("Message(proposal) payload:", messagePayload);

                      await axios.post("messages/proposal", messagePayload);

                      alert("Đã gửi proposal và tin nhắn tới chủ dự án.");
                    } catch (err) {
                      console.error("Proposal error:", err?.response || err);
                      alert(err?.response?.data?.detail || "Không thể gửi proposal. Thử lại sau.");
                    } finally {
                      setConfirmJob(null);
                    }
                  }}
                >
                  Gửi proposal
                </Button>

              </div>
            </div>
          </div>
        </>
      )}


      {/* ===== Modal tạo/sửa ===== */}
      {editing && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={closeEdit} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[min(96vw,760px)] -translate-x-1/2 -translate-y-1/2">
            <div className="rounded-2xl bg-white shadow-2xl border border-slate-200">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="font-semibold">{editing.id ? "Chỉnh sửa dự án" : "Tạo dự án mới"}</div>
                <button className="btn btn-sm btn-ghost" onClick={closeEdit}>✕</button>
              </div>

              <div className="p-5 space-y-4">
                {apiError && (
                  <div className="text-sm text-red-600 border border-red-200 bg-red-50 p-2 rounded">
                    {apiError}
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Tiêu đề</label>
                    <input
                      className={`input mt-1 w-full ${errors.title ? "border-red-500" : ""}`}
                      value={editing.title}
                      onChange={(e) => setEditing((s) => ({ ...s, title: e.target.value }))}
                      placeholder="Nhập tiêu đề dự án"
                    />
                    {errors.title && <p className="text-xs text-red-600 mt-1">{errors.title}</p>}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Danh mục</label>
                    <select
                      className={`select mt-1 w-full ${errors.categoryId ? "border-red-500" : ""}`}
                      value={editing.categoryId}
                      onChange={(e) => setEditing((s) => ({ ...s, categoryId: e.target.value }))}
                    >
                      <option value="">— Chọn danh mục —</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                    {errors.categoryId && (
                      <p className="text-xs text-red-600 mt-1">{errors.categoryId}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Mô tả</label>
                  <textarea
                    rows={4}
                    className={`textarea mt-1 w-full ${errors.description ? "border-red-500" : ""}`}
                    value={editing.description}
                    onChange={(e) => setEditing((s) => ({ ...s, description: e.target.value }))}
                    placeholder="Mô tả chi tiết yêu cầu..."
                  />
                  {errors.description && (
                    <p className="text-xs text-red-600 mt-1">{errors.description}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium">Ngân sách (đ)</label>
                    <input
                      type="number"
                      className={`input mt-1 w-full ${errors.budgetAmount ? "border-red-500" : ""}`}
                      value={editing.budgetAmount}
                      onChange={(e) => setEditing((s) => ({ ...s, budgetAmount: e.target.value }))}
                      placeholder="0"
                      min={0}
                    />
                    {errors.budgetAmount && (
                      <p className="text-xs text-red-600 mt-1">{errors.budgetAmount}</p>
                    )}
                  </div>

                  <div>
                    <label className="text-sm font-medium">Trạng thái</label>
                    <select
                      className="select mt-1 w-full"
                      value={editing.status}
                      onChange={(e) => setEditing((s) => ({ ...s, status: e.target.value }))}
                    >
                      <option value="Open">Open</option>
                      <option value="InProgress">InProgress</option>
                      <option value="Completed">Completed</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </div>

                  {/* === Multi-select Skills từ DB === */}
                  <div className="md:col-span-1">
                    <label className="text-sm font-medium">Kỹ năng</label>
                    <SkillMultiSelect
                      skills={skills}
                      value={editing.skillIds}
                      onChange={(ids) => setEditing((s) => ({ ...s, skillIds: ids }))}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 border-t flex items-center justify-end gap-2">
                <Button variant="outline" onClick={closeEdit} disabled={saving}>
                  Hủy
                </Button>
                <Button onClick={save} disabled={saving}>
                  {saving ? "Đang lưu..." : editing.id ? "Lưu thay đổi" : "Tạo dự án"}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ===== Modal XEM CHI TIẾT ===== */}
      {viewing && (
        <>
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={closeView} />
          <div className="fixed left-1/2 top-1/2 z-50 w-[min(96vw,760px)] -translate-x-1/2 -translate-y-1/2">
            <div className="rounded-2xl bg-white shadow-2xl border border-slate-200">
              <div className="p-4 border-b flex items-center justify-between">
                <div className="font-semibold">Chi tiết dự án</div>
                <button className="btn btn-sm btn-ghost" onClick={closeView}>✕</button>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-xl font-semibold">{viewing.title}</div>
                    <div className="mt-2 text-sm text-slate-600">{viewing.description}</div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="badge">{viewing.categoryName}</span>
                      {(viewing.resolvedSkills || []).map((s) => (
                        <span key={s} className="badge badge-outline">{s}</span>
                      ))}
                    </div>
                  </div>

                  <div className="text-right min-w-[160px]">
                    <div className="text-xs uppercase tracking-wide text-slate-500">Ngân sách</div>
                    <div className="text-brand-700 font-semibold">
                      {viewing.budgetAmount?.toLocaleString("vi-VN") ?? "—"} đ
                    </div>
                    <div className="mt-2 text-xs text-slate-600">
                      Trạng thái: <span className="badge badge-outline">{viewing.status}</span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      Đăng lúc: {viewing.createdAt ? new Date(viewing.createdAt).toLocaleString("vi-VN") : "—"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 border-t flex items-center justify-end gap-2">
                {viewing.isOwner ? (
                  <Button
                    variant="outline"
                    onClick={() => {
                      closeView();
                      startEdit(viewing);
                    }}
                  >
                    Chỉnh sửa
                  </Button>
                ) : (
                  viewing.status === "Open" && (
                    <Button variant="outline" onClick={() => setConfirmJob({
                      projectId: p.id,
                      title: p.title,
                      clientId: p.ownerId
                    })}>
                      Nhận job
                    </Button>

                  )
                )}
                <Button onClick={closeView}>Đóng</Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

/* ================== Mini Skill Multi-Select ================== */
function SkillMultiSelect({ skills, value = [], onChange }) {
  const [q, setQ] = useState("");
  const selected = new Set(value);

  const filtered = useMemo(() => {
    const s = (q || "").trim().toLowerCase();
    if (!s) return skills;
    return skills.filter((it) => (it.name || "").toLowerCase().includes(s));
  }, [q, skills]);

  const toggle = (id) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  };

  return (
    <div className="mt-1 w-full">
      <input
        className="input w-full mb-2"
        placeholder="Tìm kỹ năng…"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <div className="border rounded-lg h-[160px] overflow-auto p-2 space-y-1 bg-slate-50">
        {filtered.length === 0 ? (
          <div className="text-xs text-slate-500 px-1">Không có kỹ năng phù hợp</div>
        ) : (
          filtered.map((s) => (
            <label key={s.id} className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white cursor-pointer">
              <input
                type="checkbox"
                className="checkbox"
                checked={selected.has(s.id)}
                onChange={() => toggle(s.id)}
              />
              <span className="text-sm">{s.name}</span>
            </label>
          ))
        )}
      </div>
      {value?.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {skills
            .filter((s) => value.includes(s.id))
            .map((s) => (
              <span key={s.id} className="badge badge-outline">
                {s.name}
              </span>
            ))}
        </div>
      )}
    </div>
  );
}
