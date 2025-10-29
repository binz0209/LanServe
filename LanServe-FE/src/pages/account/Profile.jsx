import { useEffect, useState } from "react";
import { useOutletContext, useParams } from "react-router-dom";
import api from "../../lib/api";
import { jwtDecode } from "jwt-decode";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [skills, setSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState("");
  const [isOwner, setIsOwner] = useState(false);

  const outletContext = useOutletContext?.() || {};
  const { isEditingProfile, setIsEditingProfile } = outletContext;

  const { userId: viewedUserId } = useParams(); // 👈 nếu có userId => đang xem người khác

  useEffect(() => {
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

    const targetUserId = viewedUserId || currentUserId;

    if (!targetUserId) return;

    api
      .get(`/api/userprofiles/by-user/${targetUserId}`)
      .then(async (res) => {
        setProfile(res.data);
        setIsOwner(!viewedUserId && res.data.userId === currentUserId);

        if (res.data.skillIds?.length > 0) {
          const sres = await api.post("/api/skills/resolve", res.data.skillIds);
          setSkills(sres.data);
        }
      })
      .catch((err) => {
        console.error("Get profile error:", err.response?.data || err.message);
      });
  }, [viewedUserId]);

  useEffect(() => {
    if (isEditingProfile && isOwner) {
      api
        .get("/api/skills")
        .then((res) => setAllSkills(res.data))
        .catch((err) => console.error("Load skills error:", err));
    }
  }, [isEditingProfile, isOwner]);

  if (!profile) return <p className="p-4">Đang tải hồ sơ...</p>;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handleArrayChange = (field, value, index) => {
    const updated = [...(profile[field] || [])];
    updated[index] = value;
    setProfile((prev) => ({ ...prev, [field]: updated }));
  };

  const handleAddItem = (field) => {
    setProfile((prev) => ({
      ...prev,
      [field]: [...(prev[field] || []), ""],
    }));
  };

  const handleRemoveItem = (field, index) => {
    const updated = [...(profile[field] || [])];
    updated.splice(index, 1);
    setProfile((prev) => ({ ...prev, [field]: updated }));
  };

  const handleSave = async () => {
    try {
      await api.put(`/api/userprofiles/${profile.id}`, profile);
      alert("Cập nhật thành công!");
      setIsEditingProfile(false);
    } catch (err) {
      console.error("Update error:", err);
      alert("Cập nhật thất bại!");
    }
  };

  const handleAddSkill = async () => {
    if (!selectedSkill || profile.skillIds.includes(selectedSkill)) return; // 👈 tránh trùng skill

    try {
      const updated = {
        ...profile,
        skillIds: [...(profile.skillIds || []), selectedSkill],
      };

      await api.put(`/api/userprofiles/${profile.id}`, updated);

      const sres = await api.post("/api/skills/resolve", updated.skillIds);
      setSkills(sres.data);
      setProfile(updated);
      setSelectedSkill("");
    } catch (err) {
      console.error("Add skill error:", err);
      alert("Thêm kỹ năng thất bại!");
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      const updated = {
        ...profile,
        skillIds: profile.skillIds.filter((id) => id !== skillId),
      };

      await api.put(`/api/userprofiles/${profile.id}`, updated);

      const sres = await api.post("/api/skills/resolve", updated.skillIds);
      setSkills(sres.data);
      setProfile(updated);
    } catch (err) {
      console.error("Remove skill error:", err);
      alert("Xóa kỹ năng thất bại!");
    }
  };

  const isEditing = isOwner && isEditingProfile; // chỉ cho phép edit nếu là chủ

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      {/* Thông tin cá nhân */}
      <div className="space-y-6">
        <div className="card p-5">
          <div className="font-semibold">Thông tin cá nhân</div>

          <div className="mt-3 text-sm grid gap-2">
            {isEditing ? (
              <>
                <input
                  type="text"
                  name="title"
                  value={profile.title || ""}
                  onChange={handleChange}
                  className="input"
                  placeholder="Chức danh"
                />
                <input
                  type="text"
                  name="location"
                  value={profile.location || ""}
                  onChange={handleChange}
                  className="input"
                  placeholder="Nơi ở"
                />
                <input
                  type="number"
                  name="hourlyRate"
                  value={profile.hourlyRate || ""}
                  onChange={handleChange}
                  className="input"
                  placeholder="Rate theo giờ"
                />
              </>
            ) : (
              <>
                <div>
                  Chức danh: <b>{profile.title}</b>
                </div>
                <div>Nơi ở: {profile.location ?? "Chưa cập nhật"}</div>
                <div>Rate: {profile.hourlyRate ?? "-"} VND/h</div>
              </>
            )}
          </div>
        </div>

        {/* Ngôn ngữ */}
        <div className="card p-5">
          <div className="font-semibold mb-3">Ngôn ngữ</div>
          {isEditing ? (
            <div className="flex flex-col gap-2">
              {profile.languages?.map((lang, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={lang}
                    onChange={(e) =>
                      handleArrayChange("languages", e.target.value, i)
                    }
                    className="input flex-1"
                    placeholder="Ngôn ngữ"
                  />
                  <button
                    className="btn btn-xs btn-error"
                    onClick={() => handleRemoveItem("languages", i)}
                  >
                    ❌
                  </button>
                </div>
              ))}
              <button
                className="btn btn-xs btn-outline"
                onClick={() => handleAddItem("languages")}
              >
                + Thêm ngôn ngữ
              </button>
            </div>
          ) : (
            <div className="flex gap-2 flex-wrap">
              {profile.languages?.map((lang, i) => (
                <span key={i} className="badge">
                  {lang}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Chứng chỉ */}
        <div className="card p-5">
          <div className="font-semibold mb-3">Chứng chỉ</div>
          {isEditing ? (
            <div className="flex flex-col gap-2">
              {profile.certifications?.map((c, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={c}
                    onChange={(e) =>
                      handleArrayChange("certifications", e.target.value, i)
                    }
                    className="input flex-1"
                    placeholder="Chứng chỉ"
                  />
                  <button
                    className="btn btn-xs btn-error"
                    onClick={() => handleRemoveItem("certifications", i)}
                  >
                    ❌
                  </button>
                </div>
              ))}
              <button
                className="btn btn-xs btn-outline"
                onClick={() => handleAddItem("certifications")}
              >
                + Thêm chứng chỉ
              </button>
            </div>
          ) : (
            <ul className="text-sm space-y-2">
              {profile.certifications?.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Giới thiệu & kỹ năng */}
      <div className="lg:col-span-2 space-y-6">
        <div className="card p-5">
          <div className="font-semibold mb-3">Giới thiệu</div>
          {isEditing ? (
            <textarea
              name="bio"
              value={profile.bio || ""}
              onChange={handleChange}
              className="textarea w-full"
              placeholder="Giới thiệu"
            />
          ) : (
            <p className="text-sm text-slate-700">{profile.bio}</p>
          )}
        </div>

        <div className="card p-5">
          <div className="flex items-center justify-between">
            <div className="font-semibold">Kỹ năng chuyên môn</div>
            {isEditing && (
              <div className="flex gap-2">
                <select
                  className="select"
                  value={selectedSkill}
                  onChange={(e) => setSelectedSkill(e.target.value)}
                >
                  <option value="">-- Chọn kỹ năng --</option>
                  {allSkills.map((skill) => (
                    <option key={skill.id} value={skill.id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
                <button className="btn btn-outline" onClick={handleAddSkill}>
                  + Thêm
                </button>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {skills.map((s) => (
              <span key={s.id} className="badge flex items-center gap-1">
                {s.name}
                {isEditing && (
                  <button
                    className="ml-1 text-red-500"
                    onClick={() => handleRemoveSkill(s.id)}
                  >
                    ❌
                  </button>
                )}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Nút lưu */}
      {isEditing && (
        <div className="lg:col-span-3 text-right">
          <button className="btn btn-primary" onClick={handleSave}>
            Lưu thay đổi
          </button>
        </div>
      )}
    </div>
  );
}
