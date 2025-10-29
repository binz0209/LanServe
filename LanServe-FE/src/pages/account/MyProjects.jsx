import { useEffect, useState } from "react";
import axios from "../../lib/axios";
import { jwtDecode } from "jwt-decode";
import Button from "../../components/ui/button";

export default function MyProjects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { setLoading(false); return; }

    try {
      const dec = jwtDecode(token);
      const userId =
        dec.sub ||
        dec["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"] ||
        dec.userId;

      axios
        .get(`/projects/by-owner/${userId}`)
        .then((res) => setProjects(res.data ?? []))
        .catch((err) => console.error(err))
        .finally(() => setLoading(false));
    } catch { setLoading(false); }
  }, []);

  const statusColor = (s) =>
    s === "Open"
      ? "text-green-600 bg-green-50 border-green-200"
      : s === "InProgress"
      ? "text-blue-600 bg-blue-50 border-blue-200"
      : s === "Completed"
      ? "text-gray-600 bg-gray-50 border-gray-200"
      : "text-red-600 bg-red-50 border-red-200";

  const gotoCreate = () => (window.location.href = "/post-project");

  if (loading) return <p className="p-4">Đang tải...</p>;

  if (!projects.length)
    return (
      <div className="container-ld py-12">
        <div className="card text-center p-10">
          <div className="text-2xl font-semibold">Bạn chưa có dự án nào</div>
          <p className="text-slate-600 mt-2">Tạo dự án đầu tiên để bắt đầu tuyển Freelancer.</p>
          <Button className="mt-5" onClick={gotoCreate}>+ Tạo dự án</Button>
        </div>
      </div>
    );

  return (
    <div className="container-ld py-8 space-y-6">
      {/* Header + Create */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-semibold">Dự án của tôi</h1>
        <div className="flex gap-2">
          <Button onClick={gotoCreate}>+ Tạo dự án</Button>
        </div>
      </div>

      {/* List */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
        {projects.map((p) => {
          const key = p.id || p._id;
          return (
            <div key={key} className="card hover:shadow-lg transition">
              <div className="card-body">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-lg font-semibold truncate">{p.title}</div>
                    <div className="mt-1 text-sm text-slate-600 line-clamp-2">{p.description}</div>
                  </div>
                  <div className={`px-2 py-0.5 rounded-full text-xs border ${statusColor(p.status)}`}>
                    {p.status}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="text-xs text-slate-500">
                    Đăng: {p.createdAt ? new Date(p.createdAt).toLocaleString("vi-VN") : "—"}
                  </div>
                  <div className="text-brand-700 font-semibold">
                    {p.budgetAmount?.toLocaleString("vi-VN") ?? "—"} đ
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button variant="outline" onClick={() => (window.location.href = `/projects/${key}`)}>
                    Xem
                  </Button>
                  <Button variant="outline" onClick={() => (window.location.href = `/projects/edit/${key}`)}>
                    Chỉnh sửa
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
