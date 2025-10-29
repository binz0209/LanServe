import { useState, useEffect } from "react";
import Input from "../components/ui/input";
import Textarea from "../components/ui/textarea";
import Select from "../components/ui/select";
import Button from "../components/ui/button";
import api from "../lib/axios";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

export default function NewProject() {
  const navigate = useNavigate();

  // form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [budgetType, setBudgetType] = useState("Fixed");
  const [budgetAmount, setBudgetAmount] = useState(5000000);
  const [deadline, setDeadline] = useState("");
  const [skills, setSkills] = useState([]);

  // options
  const [categories, setCategories] = useState([]);
  const [skillOptions, setSkillOptions] = useState([]);

  // auth
  const [currentUserId, setCurrentUserId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState("");

  // ---- helpers ----
  const normId = (x) =>
    (x ?? "")
      .toString()
      .trim()
      .replace(/^ObjectId\(["']?(.+?)["']?\)$/i, "$1");

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const dec = jwtDecode(token);
      const id =
        dec.sub ||
        dec["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        dec.userId ||
        dec.uid ||
        "";
      setCurrentUserId(normId(id));
    } catch (e) {
      console.error("Decode token error:", e);
    }
  }, []);

  // load categories + skills từ backend
  useEffect(() => {
    (async () => {
      try {
        const [catRes, skillRes] = await Promise.all([
          api.get("/categories"),
          api.get("/skills"),
        ]);
        setCategories(catRes.data ?? []);
        setSkillOptions(skillRes.data ?? []);
      } catch (e) {
        console.error("Load categories/skills failed", e);
      }
    })();
  }, []);

  const toggleSkill = (id) => {
    setSkills((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const validate = () => {
    if (!currentUserId) return "Bạn chưa đăng nhập.";
    if (!title.trim()) return "Vui lòng nhập tiêu đề dự án.";
    if (!description.trim()) return "Vui lòng nhập mô tả dự án.";
    if (!categoryId) return "Vui lòng chọn danh mục.";
    if (!budgetAmount || Number(budgetAmount) <= 0)
      return "Ngân sách không hợp lệ.";
    if (!deadline) return "Vui lòng chọn thời hạn hoàn thành.";
    return "";
  };

  // NEW: chỉ kiểm tra số dư, không trừ tiền ở bước tạo project
  async function getWalletBalance(userId) {
    if (!userId) return 0;
    try {
      // BE: GET /api/wallets/{userId} -> { balance }
      const res = await api.get(`/wallets/${userId}`);
      return Number(res.data?.balance || 0);
    } catch {
      return 0;
    }
  }

  const handleSubmit = async () => {
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }
    setErr("");
    try {
      setSubmitting(true);

      const deadlineIso = deadline
        ? new Date(`${deadline}T00:00:00`).toISOString()
        : null;

      const payload = {
        ownerId: currentUserId,
        title,
        description,
        categoryId: categoryId || null,
        skillIds: skills,
        budgetType,
        budgetAmount: budgetAmount ? Number(budgetAmount) : 0,
        deadline: deadlineIso,
        status: "Open",
      };

      // ① KIỂM TRA SỐ DƯ (không trừ tiền)
      const required = Number(payload.budgetAmount || 0);
      if (payload.budgetType === "Fixed" && required > 0) {
        const balance = await getWalletBalance(currentUserId);
        if (balance < required) {
          alert(
            `Số dư ví không đủ để chi trả cho dự án này.\n` +
            `Cần: ${required.toLocaleString("vi-VN")} VND\n` +
            `Hiện có: ${balance.toLocaleString("vi-VN")} VND\n\n` +
            `Vui lòng nạp thêm tiền trước khi đăng dự án.`
          );
          return; // dừng lại, không tạo project
        }
      }

      // ② TẠO PROJECT (không rút tiền ở bước này)
      await api.post("/projects", payload);

      alert("Đăng dự án thành công!");
      navigate("/projects");
    } catch (e) {
      console.error("Create project failed", e?.response?.data || e);
      alert(
        e?.response?.data?.detail ||
          e?.response?.data?.message ||
          "Có lỗi khi đăng dự án"
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-ld py-10">
      <h1 className="text-3xl font-semibold text-center">Đăng dự án mới</h1>

      {err && (
        <div className="mt-6 text-sm text-red-700 bg-red-50 border border-red-200 p-3 rounded">
          {err}
        </div>
      )}

      <div className="mt-8 space-y-6">
        {/* Thông tin dự án */}
        <div className="card">
          <div className="card-header p-5 font-semibold">Thông tin dự án</div>
          <div className="card-body grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Tiêu đề dự án *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Thiết kế logo cho công ty công nghệ"
              />
            </div>

            <div>
              <label className="text-sm">Danh mục *</label>
              <Select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              >
                <option value="">--Chọn danh mục--</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div className="md:col-span-2">
              <label className="text-sm">Mô tả dự án *</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả chi tiết yêu cầu, mục tiêu và kỳ vọng..."
              />
            </div>
          </div>
        </div>

        {/* Ngân sách */}
        <div className="card">
          <div className="card-header p-5 font-semibold">Ngân sách</div>
          <div className="card-body grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Loại ngân sách *</label>
              <div className="mt-2 flex gap-6 text-sm">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="budgetType"
                    value="Fixed"
                    checked={budgetType === "Fixed"}
                    onChange={(e) => setBudgetType(e.target.value)}
                  />
                  Giá cố định
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="budgetType"
                    value="Hourly"
                    checked={budgetType === "Hourly"}
                    onChange={(e) => setBudgetType(e.target.value)}
                  />
                  Theo giờ
                </label>
              </div>
            </div>

            <div>
              <label className="text-sm">Tổng ngân sách (VND) *</label>
              <Input
                type="number"
                value={budgetAmount}
                onChange={(e) => setBudgetAmount(Number(e.target.value))}
                min={0}
              />
            </div>
          </div>
        </div>

        {/* Thời gian */}
        <div className="card">
          <div className="card-header p-5 font-semibold">Thời gian</div>
          <div className="card-body grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm">Thời gian hoàn thành *</label>
              <Input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Kỹ năng */}
        <div className="card">
          <div className="card-header p-5 font-semibold">Kỹ năng cần thiết</div>
          <div className="card-body grid md:grid-cols-3 gap-3 text-sm">
            {skillOptions.map((s) => (
              <label key={s.id} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={skills.includes(s.id)}
                  onChange={() => toggleSkill(s.id)}
                />
                {s.name}
              </label>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => navigate("/projects")} disabled={submitting}>
            Hủy bỏ
          </Button>
          <Button onClick={handleSubmit} disabled={submitting}>
            {submitting ? "Đang đăng..." : "Đăng dự án"}
          </Button>
        </div>
      </div>
    </div>
  );
}
