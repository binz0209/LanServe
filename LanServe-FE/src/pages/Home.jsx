import Button from '../components/ui/button'
import { useEffect, useState } from 'react'
import api from '../lib/api'
import { useNavigate, Link } from "react-router-dom";
import BannerCarousel from '../components/BannerCarousel';
import { jwtDecode } from 'jwt-decode';

export default function Home() {
  const [categories, setCategories] = useState([]);
  const [freelancers, setFreelancers] = useState([]);
  const [recommendedProjects, setRecommendedProjects] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/api/categories")
      .then(res => setCategories(res.data ?? []))
      .catch(err => console.error("Load categories failed", err));

    // dùng /users vì BE chưa có /userprofiles
    api.get("/api/users")
      .then(res => setFreelancers(res.data ?? []))
      .catch(err => console.error("Load freelancers failed", err));

    // Load recommended projects nếu đã đăng nhập
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      try {
        setIsLoggedIn(true);
        api.get("/api/projects/recommended?limit=6")
          .then(res => {
            const data = res.data || [];
            setRecommendedProjects(data.map(item => ({
              ...item.project,
              similarity: item.similarity
            })));
          })
          .catch(err => {
            console.error("Load recommended projects failed", err);
            // Nếu lỗi 401, user chưa có profile hoặc chưa có skills
          });
      } catch (e) {
        console.error("Token decode error:", e);
      }
    }
  }, []);

  return (
    <div>
      {/* Banners Carousel */}
      <section className="container-ld py-8">
        <BannerCarousel />
      </section>

      {/* Hero */}
      <section className="bg-gradient-to-r from-blue-50 to-orange-50 border-b">
        <div className="container-ld py-16">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Kết nối <span className="text-brand-700">Freelancer</span> & <span className="text-accent">Khách hàng</span>
            </h1>
            <p className="mt-4 text-slate-600 max-w-2xl mx-auto">
              Tìm kiếm freelancer năng lực hoặc dự án phù hợp. Xây dựng sự nghiệp tự do với LanServe.
            </p>
            <div className="mt-6 flex gap-3 justify-center">
              <Button>Tìm Freelancer</Button>
              <Button variant="outline" as={Link} to="/post-project">Đăng Dự Án</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="container-ld py-12">
        <h2 className="text-2xl font-semibold">Danh mục dịch vụ</h2>
        <div className="mt-6 grid md:grid-cols-3 lg:grid-cols-4 gap-5">
          {categories.map((c, i) => (
            <div key={c.id || c._id || `cat-${i}`} className="card p-5">
              <div className="text-xl">📦</div>
              <div className="mt-3 font-medium">{c.name}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Projects (chỉ hiển thị khi đã đăng nhập) */}
      {isLoggedIn && recommendedProjects.length > 0 && (
        <section className="bg-gradient-to-br from-blue-50 to-purple-50 border-y">
          <div className="container-ld py-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold">Dự án phù hợp với bạn</h2>
              <Link to="/account/projects" className="text-brand-700 hover:underline text-sm">
                Xem tất cả →
              </Link>
            </div>
            <div className="mt-6 grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendedProjects.map((project) => (
                <div key={project.id} className="card p-5 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg flex-1">{project.title}</h3>
                    {project.similarity !== undefined && (
                      <span className="ml-2 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                        {project.similarity}% phù hợp
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-600 line-clamp-2 mb-3">
                    {project.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-brand-700 font-semibold">
                      {project.budgetAmount?.toLocaleString("vi-VN") ?? "—"} đ
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      as={Link}
                      to={`/account/projects?view=${project.id}`}
                    >
                      Xem chi tiết
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Freelancers */}
      <section className="bg-white border-y">
        <div className="container-ld py-12">
          <h2 className="text-2xl font-semibold">Freelancer nổi bật</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-5">
            {freelancers.slice(0, 3).map((f, i) => (
              <div key={f.id || `user-${i}`} className="card p-5">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-slate-200" />
                  <div>
                    <div className="font-medium">{f.fullName}</div>
                    <div className="text-sm text-slate-500">{f.email}</div>
                  </div>
                </div>
                <Button className="mt-4 w-full" variant="outline">Xem hồ sơ</Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-blue-500 to-orange-500 text-white">
        <div className="container-ld py-14 text-center">
          <h2 className="text-3xl font-semibold">Sẵn sàng bắt đầu dự án của bạn?</h2>
          <div className="mt-6 flex gap-3 justify-center">
            <Button className="bg-white text-slate-900">Đăng ký miễn phí</Button>
            <Button variant="outline" className="border-white text-black">Tìm hiểu thêm</Button>
          </div>
        </div>
      </section>
    </div>
  );
}
