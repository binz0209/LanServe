# LanServe - Nền tảng tìm việc và tuyển dụng Freelancer

Chào mừng đến với LanServe, nơi kết nối các freelancer tài năng với những dự án hấp dẫn! Nền tảng của chúng tôi được thiết kế để giúp bạn dễ dàng tìm kiếm công việc, quản lý dự án, và xây dựng sự nghiệp freelance vững chắc.

## Các tính năng nổi bật

### Dành cho Freelancer:
- **Tìm kiếm dự án:** Duyệt qua hàng ngàn dự án phù hợp với kỹ năng của bạn.
- **Quản lý hồ sơ:** Tạo và cập nhật hồ sơ chuyên nghiệp, thể hiện kinh nghiệm và portfolio.
- **Gửi đề xuất:** Dễ dàng gửi đề xuất cho các dự án bạn quan tâm.
- **Quản lý hợp đồng:** Theo dõi và quản lý các hợp đồng đã ký.
- **Hệ thống thanh toán an toàn:** Nhận thanh toán nhanh chóng và bảo mật.

### Dành cho Chủ dự án:
- **Đăng dự án:** Tạo và đăng các dự án một cách nhanh chóng.
- **Tìm kiếm Freelancer:** Duyệt qua hồ sơ của các freelancer để tìm người phù hợp nhất.
- **Quản lý dự án:** Theo dõi tiến độ và giao tiếp với freelancer.
- **Quản lý hợp đồng:** Tạo và quản lý các hợp đồng dịch vụ.
- **Hệ thống thanh toán tiện lợi:** Thanh toán cho freelancer một cách dễ dàng.

### Tính năng chung:
- **Xác thực người dùng:** Đăng ký, đăng nhập an toàn với JWT.
- **Phân quyền:** Vai trò người dùng (User, Admin) với các quyền truy cập khác nhau.
- **Giao diện thân thiện:** Thiết kế hiện đại, dễ sử dụng với Tailwind CSS.

## Công nghệ sử dụng

### Frontend:
- **React 19:** Thư viện JavaScript để xây dựng giao diện người dùng.
- **Vite:** Công cụ build nhanh cho các dự án frontend.
- **React Router DOM:** Quản lý định tuyến trong ứng dụng SPA.
- **Tailwind CSS:** Framework CSS utility-first để thiết kế nhanh.
- **Recharts:** Thư viện biểu đồ để hiển thị dữ liệu thống kê.
- **Lucide React:** Thư viện icon đẹp và dễ sử dụng.
- **Axios:** Client HTTP để gọi API.
- **jwt-decode:** Giải mã JWT trên client-side.

### Backend:
- **.NET 8 (C#):** Framework mạnh mẽ để xây dựng API.
- **ASP.NET Core:** Xây dựng các dịch vụ web RESTful.
- **MongoDB:** Cơ sở dữ liệu NoSQL linh hoạt.
- **JWT (JSON Web Tokens):** Xác thực và ủy quyền.
- **BCrypt.Net:** Mã hóa mật khẩu.
- **VNPAY Integration:** Tích hợp cổng thanh toán VNPAY.

## Cấu trúc dự án

```
LanServe/
├── LanServe-FE/          # Frontend React
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.js
├── LanServe-BE/          # Backend .NET
│   ├── LanServe.Api/
│   ├── LanServe.Application/
│   ├── LanServe.Domain/
│   ├── LanServe.Infrastructure/
│   ├── LanServe.Tests/
│   └── LanServe.sln
├── .github/workflows/
├── .gitignore
└── README.md
```

## Triển khai

### Frontend:
- **Vercel:** Triển khai tự động và nhanh chóng.
- URL: `https://lanserve.vercel.app/`

### Backend:
- **Azure App Service:** Triển khai API backend.
- URL: `https://lanserve-api-cgfghcd9bshbazbd.malaysiawest-01.azurewebsites.net/`

## Truy cập Admin Dashboard

- Admin Dashboard có sẵn tại: `https://lanserve.vercel.app/admin`
- Yêu cầu tài khoản có vai trò "Admin".

## Bắt đầu phát triển

### Clone Repository:
```bash
git clone https://github.com/binz0209/LanServe.git
cd LanServe
```

### Frontend (LanServe-FE):
```bash
cd LanServe-FE
npm install
npm run dev
```
- Frontend sẽ chạy tại: `http://localhost:5174`

### Backend (LanServe-BE):
```bash
cd LanServe-BE
dotnet restore
dotnet run --project LanServe.Api
```
- Backend sẽ chạy tại: `http://localhost:5070`

## Workflow Git

- **`main`:** Nhánh production để deploy
- **`dev`:** Nhánh development để code và test local

## Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng tạo issue hoặc pull request để đề xuất cải tiến.

---

**LanServe** - Kết nối tài năng, kiến tạo thành công.