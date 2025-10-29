import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../lib/api";
import { jwtDecode } from "jwt-decode";

export default function UserSearch() {
  const [users, setUsers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [skills, setSkills] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSkill, setSelectedSkill] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("token");
  let currentUserId = null;
  if (token) {
    const decoded = jwtDecode(token);
    currentUserId =
      decoded.sub ||
      decoded[
        "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
      ] ||
      decoded.userId;
  }

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const userRes = await api.get("/api/users");
      setUsers(userRes.data);
      const profRes = await api.get("/api/userprofiles/all").catch(() => null);
      if (profRes?.data) setProfiles(profRes.data);
      const skillRes = await api.get("/api/skills");
      setSkills(skillRes.data);
    } catch (err) {
      console.error("Fetch data error:", err);
    } finally {
      setLoading(false);
    }
  };

  const normalize = (str) =>
    str
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") || "";

  const filteredUsers = users.filter((u) => {
    const nameMatch = normalize(u.fullName).includes(normalize(search));
    const userProfile = profiles.find((p) => p.userId === u.id);
    if (selectedSkill) {
      return nameMatch && userProfile?.skillIds?.includes(selectedSkill);
    }
    return nameMatch;
  });

  return (
    <div className="container-ld py-10">
      <h1 className="text-2xl font-semibold mb-4">🔍 Tìm kiếm người dùng</h1>

      <div className="flex flex-col md:flex-row gap-3 mb-6">
        <input
          type="text"
          className="input flex-1"
          placeholder="Nhập tên người dùng..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="select flex-1"
          value={selectedSkill}
          onChange={(e) => setSelectedSkill(e.target.value)}
        >
          <option value="">-- Tất cả kỹ năng --</option>
          {skills.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <div className="grid gap-4">
          {filteredUsers.map((u) => (
            <div
              key={u.id}
              className="card p-4 flex items-center justify-between border"
            >
              <div>
                <div className="font-semibold">{u.fullName}</div>
                <div className="text-sm text-slate-500">{u.email}</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {profiles
                    .find((p) => p.userId === u.id)
                    ?.skillIds?.map((sid) => {
                      const skill = skills.find((s) => s.id === sid);
                      return (
                        skill && (
                          <span key={sid} className="badge">
                            {skill.name}
                          </span>
                        )
                      );
                    })}
                </div>
              </div>

              <button
                className="btn btn-outline"
                onClick={() => {
                  if (u.id === currentUserId) {
                    // 👉 Là chính mình → về account layout
                    navigate("/account/profile");
                  } else {
                    // 👉 Là người khác → về trang profile riêng
                    navigate(`/profile/${u.id}`);
                  }
                }}
              >
                Xem hồ sơ
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && filteredUsers.length === 0 && (
        <p className="text-slate-500 mt-4">Hãy Đăng nhập để xem danh sách người dùng.</p>
      )}
    </div>
  );
}
