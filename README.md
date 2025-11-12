# LanServe - Nền tảng tìm việc và tuyển dụng Freelancer

Chào mừng đến với LanServe, nơi kết nối các freelancer tài năng với những dự án hấp dẫn! Nền tảng của chúng tôi được thiết kế để giúp bạn dễ dàng tìm kiếm công việc, quản lý dự án, và xây dựng sự nghiệp freelance vững chắc.

## 🌟 Các tính năng nổi bật

### Dành cho Freelancer:
- **Tìm kiếm dự án thông minh:** Duyệt qua hàng ngàn dự án phù hợp với kỹ năng của bạn, với hệ thống đề xuất dự án dựa trên AI (Gemini 2.5 Flash).
- **Quản lý hồ sơ chuyên nghiệp:** Tạo và cập nhật hồ sơ với avatar, portfolio, và các kỹ năng của bạn.
- **Gửi đề xuất:** Dễ dàng gửi đề xuất giá cho các dự án bạn quan tâm.
- **Tin nhắn real-time:** Giao tiếp với chủ dự án qua hệ thống tin nhắn real-time với SignalR, tương tự Facebook Messenger.
- **Quản lý hợp đồng:** Theo dõi và quản lý các hợp đồng đã ký.
- **Hệ thống thanh toán an toàn:** Nhận thanh toán nhanh chóng và bảo mật qua VNPAY.
- **Ví điện tử:** Quản lý số dư và lịch sử giao dịch.

### Dành cho Chủ dự án:
- **Đăng dự án:** Tạo và đăng các dự án với hình ảnh minh họa một cách nhanh chóng.
- **Tìm kiếm Freelancer:** Duyệt qua hồ sơ của các freelancer để tìm người phù hợp nhất.
- **Quản lý dự án:** Theo dõi tiến độ và giao tiếp với freelancer qua tin nhắn real-time.
- **Quản lý đề xuất:** Xem và chấp nhận/từ chối các đề xuất từ freelancer.
- **Quản lý hợp đồng:** Tạo và quản lý các hợp đồng dịch vụ.
- **Hệ thống thanh toán tiện lợi:** Thanh toán cho freelancer một cách dễ dàng qua VNPAY.

### Tính năng Admin:
- **Dashboard thống kê:** Xem tổng quan hệ thống với các chỉ số thời gian thực và biểu đồ.
- **Quản lý người dùng:** CRUD đầy đủ cho người dùng với pagination và lazy loading.
- **Quản lý dự án:** Quản lý tất cả dự án trong hệ thống.
- **Quản lý hợp đồng:** Theo dõi và quản lý tất cả hợp đồng.
- **Quản lý banner:** Tùy chỉnh các banner hiển thị trên trang chủ với carousel tự động.

### Tính năng chung:
- **Xác thực người dùng:** Đăng ký, đăng nhập an toàn với JWT, hỗ trợ "Remember Me".
- **Phân quyền:** Vai trò người dùng (User, Admin) với các quyền truy cập khác nhau.
- **Real-time notifications:** Nhận thông báo real-time về đề xuất, hợp đồng, tin nhắn mới.
- **Upload ảnh:** Upload và quản lý ảnh cho dự án và avatar người dùng qua Cloudinary.
- **Giao diện thân thiện:** Thiết kế hiện đại, responsive với Tailwind CSS.
- **Hệ thống đề xuất thông minh:** Sử dụng Gemini AI để phân tích kỹ năng và đề xuất dự án phù hợp.

## 🛠️ Công nghệ sử dụng

### Frontend:
- **React 19:** Thư viện JavaScript hiện đại để xây dựng giao diện người dùng.
- **Vite 7:** Công cụ build nhanh và hiệu quả cho các dự án frontend.
- **React Router DOM 7:** Quản lý định tuyến trong ứng dụng SPA.
- **Tailwind CSS 3:** Framework CSS utility-first để thiết kế nhanh và responsive.
- **Recharts 3:** Thư viện biểu đồ để hiển thị dữ liệu thống kê.
- **Lucide React:** Thư viện icon đẹp và dễ sử dụng.
- **Axios:** Client HTTP để gọi API.
- **SignalR Client:** Kết nối real-time với backend qua WebSocket.
- **React Hook Form + Zod:** Form validation mạnh mẽ.
- **Zustand:** State management nhẹ và đơn giản.
- **Sonner:** Toast notifications đẹp mắt.
- **DOMPurify:** Sanitize HTML để hiển thị tin nhắn an toàn.

### Backend:
- **.NET 8 (C#):** Framework mạnh mẽ để xây dựng API RESTful.
- **ASP.NET Core:** Xây dựng các dịch vụ web hiện đại.
- **MongoDB:** Cơ sở dữ liệu NoSQL linh hoạt và scalable.
- **JWT (JSON Web Tokens):** Xác thực và ủy quyền an toàn.
- **BCrypt.Net:** Mã hóa mật khẩu một chiều.
- **SignalR:** Real-time communication cho tin nhắn và notifications.
- **VNPAY Integration:** Tích hợp cổng thanh toán VNPAY.
- **Cloudinary:** Quản lý và lưu trữ hình ảnh.
- **Gemini 2.5 Flash API:** AI để phân tích kỹ năng và đề xuất dự án.
- **Mapster:** Object mapping nhanh chóng.
- **Serilog:** Logging mạnh mẽ và cấu hình linh hoạt.
- **Swagger/OpenAPI:** API documentation tự động.

## 📁 Cấu trúc dự án

```
LanServe/
├── LanServe-FE/                    # Frontend React
│   ├── src/
│   │   ├── components/             # Các component tái sử dụng
│   │   │   ├── BannerCarousel.jsx  # Carousel banner cho trang chủ
│   │   │   ├── ImageUpload.jsx     # Component upload ảnh
│   │   │   ├── Navbar.jsx          # Navigation bar
│   │   │   ├── Spinner.jsx         # Loading spinner
│   │   │   └── ...
│   │   ├── pages/                  # Các trang của ứng dụng
│   │   │   ├── account/            # Trang tài khoản
│   │   │   │   ├── Messages.jsx    # Tin nhắn real-time
│   │   │   │   ├── Projects.jsx    # Quản lý dự án
│   │   │   │   ├── Profile.jsx     # Hồ sơ người dùng
│   │   │   │   └── Settings.jsx    # Cài đặt
│   │   │   ├── admin/              # Trang admin
│   │   │   │   ├── Dashboard.jsx   # Dashboard thống kê
│   │   │   │   ├── Users.jsx       # Quản lý người dùng
│   │   │   │   ├── Projects.jsx    # Quản lý dự án
│   │   │   │   ├── Contracts.jsx   # Quản lý hợp đồng
│   │   │   │   └── Banners.jsx     # Quản lý banner
│   │   │   └── ...
│   │   ├── lib/                    # Utilities và helpers
│   │   │   ├── api.js              # API client
│   │   │   ├── axios.js            # Axios configuration
│   │   │   └── ...
│   │   ├── services/               # Services
│   │   │   ├── signalrClient.js    # SignalR client cho notifications
│   │   │   └── ...
│   │   ├── stores/                 # Zustand stores
│   │   │   ├── notificationStore.js
│   │   │   └── ...
│   │   └── App.jsx                 # Main app component
│   ├── public/                     # Static files
│   ├── dist/                       # Build output (ignored)
│   ├── node_modules/               # Dependencies (ignored)
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── vercel.json                 # Vercel deployment config
│
├── LanServe-BE/                    # Backend .NET
│   ├── LanServe.Api/               # API Layer
│   │   ├── Controllers/            # API Controllers
│   │   │   ├── AuthController.cs
│   │   │   ├── ProjectsController.cs
│   │   │   ├── MessagesController.cs
│   │   │   ├── PaymentsController.cs
│   │   │   ├── BannersController.cs
│   │   │   └── ...
│   │   ├── Hubs/                   # SignalR Hubs
│   │   │   ├── MessageHub.cs       # Real-time messaging
│   │   │   ├── NotificationHub.cs  # Real-time notifications
│   │   │   └── CustomUserIdProvider.cs
│   │   ├── Services/               # API Services
│   │   ├── Middlewares/            # Custom middlewares
│   │   ├── Filters/                # Exception filters
│   │   ├── Program.cs              # Startup configuration
│   │   └── appsettings.json        # Configuration
│   │
│   ├── LanServe.Application/       # Application Layer
│   │   ├── Services/               # Business logic services
│   │   │   ├── ProjectService.cs   # Project business logic
│   │   │   ├── MessageService.cs   # Message business logic
│   │   │   ├── PaymentService.cs   # Payment business logic
│   │   │   └── ...
│   │   ├── Interfaces/            # Service interfaces
│   │   │   ├── Services/           # Service contracts
│   │   │   │   ├── IProjectService.cs
│   │   │   │   ├── IGeminiService.cs
│   │   │   │   ├── IVectorService.cs
│   │   │   │   └── ...
│   │   │   └── Repositories/       # Repository contracts
│   │   ├── DTOs/                   # Data Transfer Objects
│   │   └── Validators/             # FluentValidation validators
│   │
│   ├── LanServe.Domain/            # Domain Layer
│   │   ├── Entities/               # Domain entities
│   │   │   ├── User.cs
│   │   │   ├── Project.cs
│   │   │   ├── Message.cs
│   │   │   ├── Contract.cs
│   │   │   ├── Banner.cs
│   │   │   └── ...
│   │   ├── Enums/                  # Domain enums
│   │   └── ValueObjects/           # Value objects
│   │
│   ├── LanServe.Infrastructure/     # Infrastructure Layer
│   │   ├── Repositories/           # MongoDB repositories
│   │   ├── Services/               # Infrastructure services
│   │   │   ├── GeminiService.cs    # Gemini AI integration
│   │   │   ├── VectorService.cs    # Vector similarity calculation
│   │   │   ├── CloudinaryImageUploadService.cs
│   │   │   └── ...
│   │   ├── Data/                   # Data access
│   │   │   ├── MongoDbContext.cs
│   │   │   └── MongoOptions.cs
│   │   └── Initialization/         # DB initialization
│   │
│   ├── LanServe.Tests/              # Unit tests
│   └── LanServe.sln                # Solution file
│
├── .gitignore                       # Git ignore rules
├── README.md                        # This file
└── start-dev.ps1                    # Development startup script
```

## 🚀 Triển khai

### Frontend:
- **Platform:** Vercel
- **URL:** https://lanserve.vercel.app/
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Framework:** Vite
- **API Proxy:** `/api/*` requests được proxy đến backend Azure

### Backend:
- **Platform:** Azure App Service
- **URL:** https://lanserve-api-cgfghcd9bshbazbd.malaysiawest-01.azurewebsites.net/
- **Runtime:** .NET 8
- **Database:** MongoDB Atlas

## 🔐 Truy cập Admin Dashboard

- **URL:** https://lanserve.vercel.app/admin
- **Yêu cầu:** Tài khoản có vai trò "Admin"
- **Tính năng:**
  - Dashboard với thống kê real-time
  - Quản lý người dùng (CRUD)
  - Quản lý dự án (CRUD)
  - Quản lý hợp đồng (CRUD)
  - Quản lý banner cho trang chủ
  - Xem thống kê chi tiết

## 🏁 Bắt đầu phát triển

### Yêu cầu hệ thống:
- **Node.js:** >= 18.x
- **.NET SDK:** >= 8.0
- **MongoDB:** MongoDB Atlas (cloud) hoặc local MongoDB
- **Git:** Để clone repository

### Clone Repository:
```bash
git clone https://github.com/binz0209/LanServe.git
cd LanServe
```

### Frontend (LanServe-FE):

1. **Cài đặt dependencies:**
```bash
cd LanServe-FE
npm install
```

2. **Chạy development server:**
```bash
npm run dev
```
- Frontend sẽ chạy tại: `http://localhost:5174` (hoặc port khác nếu 5174 bận)

3. **Build cho production:**
```bash
npm run build
```

4. **Preview production build:**
```bash
npm run preview
```

### Backend (LanServe-BE):

1. **Cấu hình MongoDB:**
   - Tạo file `appsettings.Development.json` trong `LanServe.Api/` (nếu chưa có)
   - Hoặc cập nhật `appsettings.json` với connection string MongoDB của bạn

2. **Restore dependencies:**
```bash
cd LanServe-BE
dotnet restore
```

3. **Chạy backend:**
```bash
dotnet run --project LanServe.Api
```
- Backend sẽ chạy tại: `http://localhost:5070`
- Swagger UI: `http://localhost:5070/swagger`

4. **Build cho production:**
```bash
dotnet build --configuration Release
```

### Cấu hình môi trường:

#### Frontend:
- Tạo file `.env` trong `LanServe-FE/` (nếu cần):
```env
VITE_API_URL=http://localhost:5070/api
```

#### Backend:
- Cấu hình trong `appsettings.json` hoặc `appsettings.Development.json`:
  - MongoDB connection string
  - JWT secret key
  - VNPAY credentials (nếu dùng thanh toán)
  - Cloudinary credentials (nếu dùng upload ảnh)
  - Gemini API key (nếu dùng recommendation system)

## 🔄 Workflow Git

- **`main`:** Nhánh production để deploy
- **`dev`:** Nhánh development để code và test local
- **Convention:** Commit message nên có prefix `[LinhNHH]` cho các thay đổi của developer

### Quy trình làm việc:
1. Làm việc trên nhánh `dev`
2. Test kỹ trước khi merge vào `main`
3. Merge `dev` vào `main` khi sẵn sàng deploy
4. Deploy frontend lên Vercel từ nhánh `main`
5. Deploy backend lên Azure (tự làm)

## 📦 Dependencies chính

### Frontend:
- `react` ^19.1.1
- `react-router-dom` ^7.9.1
- `@microsoft/signalr` ^9.0.6 (Real-time communication)
- `axios` ^1.12.2
- `zustand` ^5.0.8 (State management)
- `react-hook-form` ^7.63.0 + `zod` ^4.1.11 (Form validation)
- `recharts` ^3.3.0 (Charts)
- `tailwindcss` ^3.4.13
- `vite` ^7.1.7

### Backend:
- `Microsoft.AspNetCore.Authentication.JwtBearer` ^8.*
- `MongoDB.Driver` ^3.5.0
- `Microsoft.AspNetCore.SignalR` (Real-time)
- `Mapster` ^7.4.0
- `Serilog.AspNetCore` ^9.0.0
- `Swashbuckle.AspNetCore` ^9.0.6

## 🎯 Tính năng nổi bật

### 1. Real-time Messaging
- Sử dụng SignalR để gửi/nhận tin nhắn real-time
- UI/UX tương tự Facebook Messenger
- Đánh dấu tin nhắn đã đọc/chưa đọc
- Hiển thị số lượng tin nhắn chưa đọc

### 2. Hệ thống đề xuất thông minh
- Sử dụng Gemini 2.5 Flash để phân tích kỹ năng từ bio và mô tả dự án
- Tính toán độ tương đồng dựa trên kỹ năng và category
- Hiển thị phần trăm phù hợp cho mỗi dự án được đề xuất

### 3. Upload và quản lý ảnh
- Upload ảnh cho dự án (nhiều ảnh)
- Upload avatar cho người dùng
- Sử dụng Cloudinary để lưu trữ và quản lý ảnh
- Hiển thị ảnh trong popup chi tiết dự án

### 4. Banner Management
- Admin có thể quản lý banner hiển thị trên trang chủ
- Carousel tự động chuyển slide
- CRUD đầy đủ cho banner

### 5. Pagination và Lazy Loading
- Infinite scroll cho danh sách dự án, tin nhắn, người dùng
- Loading spinner khi đang tải
- Tối ưu hiệu suất với lazy loading

## 🤝 Đóng góp

Mọi đóng góp đều được chào đón! Vui lòng:
1. Fork repository
2. Tạo feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m '[LinhNHH] Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Tạo Pull Request

## 📝 License

Dự án này là mã nguồn mở và có sẵn dưới [MIT License](LICENSE).

## 👥 Tác giả

- **LinhNHH** - *Nguyen Huu Hoai Linh* - [GitHub](https://github.com/binz0209)
- **HungNX** - *Nguyen Xuan Hung*
- **AnPV** - *Pham Van An*

## 🙏 Lời cảm ơn

- MongoDB Atlas cho database hosting
- Vercel cho frontend hosting
- Azure cho backend hosting
- Cloudinary cho image hosting
- Google Gemini cho AI recommendation

---

**LanServe** - Kết nối tài năng, kiến tạo thành công. 🚀
