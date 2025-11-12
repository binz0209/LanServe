# LanServe - Nền tảng tìm việc và tuyển dụng Freelancer

Chào mừng đến với LanServe, nơi kết nối các freelancer tài năng với những dự án hấp dẫn! Nền tảng của chúng tôi được thiết kế để giúp bạn dễ dàng tìm kiếm công việc, quản lý dự án, và xây dựng sự nghiệp freelance vững chắc.

## 🌟 Các tính năng nổi bật

### Dành cho Freelancer:
- **Tìm kiếm dự án thông minh:** Duyệt qua hàng ngàn dự án phù hợp với kỹ năng của bạn, với hệ thống đề xuất dự án dựa trên AI (Gemini 2.5 Flash).
- **Quản lý hồ sơ chuyên nghiệp:** Tạo và cập nhật hồ sơ với avatar, portfolio, và các kỹ năng của bạn.
- **Gửi đề xuất:** Dễ dàng gửi đề xuất giá cho các dự án bạn quan tâm, có thể chỉnh sửa hoặc hủy đề xuất.
- **Tin nhắn real-time:** Giao tiếp với chủ dự án qua hệ thống tin nhắn real-time với SignalR, tương tự Facebook Messenger.
- **Quản lý hợp đồng:** Theo dõi và quản lý các hợp đồng đã ký.
- **Hệ thống thanh toán an toàn:** Nhận thanh toán nhanh chóng và bảo mật qua VNPAY.
- **Ví điện tử:** Quản lý số dư và lịch sử giao dịch nạp tiền.

### Dành cho Chủ dự án:
- **Đăng dự án:** Tạo và đăng các dự án với hình ảnh minh họa một cách nhanh chóng.
- **Tìm kiếm Freelancer:** Duyệt qua hồ sơ của các freelancer để tìm người phù hợp nhất.
- **Quản lý dự án:** Theo dõi tiến độ và giao tiếp với freelancer qua tin nhắn real-time.
- **Quản lý đề xuất:** Xem và chấp nhận/từ chối các đề xuất từ freelancer.
- **Quản lý hợp đồng:** Tạo và quản lý các hợp đồng dịch vụ.
- **Hệ thống thanh toán tiện lợi:** Thanh toán cho freelancer một cách dễ dàng qua VNPAY.

### Tính năng Admin:
- **Dashboard thống kê:** Xem tổng quan hệ thống với các chỉ số thời gian thực và biểu đồ, tính toán phần trăm thay đổi so với tháng trước.
- **Quản lý người dùng:** CRUD đầy đủ cho người dùng với pagination và lazy loading.
- **Quản lý dự án:** Quản lý tất cả dự án trong hệ thống với CRUD đầy đủ.
- **Quản lý hợp đồng:** Theo dõi và quản lý tất cả hợp đồng với CRUD đầy đủ.
- **Quản lý banner:** Tùy chỉnh các banner hiển thị trên trang chủ với carousel tự động.
- **Thống kê chi tiết:** Xem biểu đồ doanh thu, dự án theo thời gian.

### Tính năng chung:
- **Xác thực người dùng:** Đăng ký, đăng nhập an toàn với JWT, hỗ trợ "Remember Me", Google OAuth, quên mật khẩu.
- **Phân quyền:** Vai trò người dùng (User, Admin) với các quyền truy cập khác nhau.
- **Real-time notifications:** Nhận thông báo real-time về đề xuất, hợp đồng, tin nhắn mới, dự án mới.
- **Upload ảnh:** Upload và quản lý ảnh cho dự án và avatar người dùng qua Cloudinary.
- **Giao diện thân thiện:** Thiết kế hiện đại, responsive với Tailwind CSS.
- **Hệ thống đề xuất thông minh:** Sử dụng Gemini AI để phân tích kỹ năng và đề xuất dự án phù hợp.
- **Pagination & Lazy Loading:** Infinite scroll cho danh sách dự án, tin nhắn, người dùng.
- **Read/Unread Tracking:** Theo dõi tin nhắn đã đọc/chưa đọc với badge số lượng.

## 🛠️ Công nghệ sử dụng

### Frontend:
- **React 19:** Thư viện JavaScript hiện đại để xây dựng giao diện người dùng.
- **Vite 7:** Công cụ build nhanh và hiệu quả cho các dự án frontend.
- **React Router DOM 7:** Quản lý định tuyến trong ứng dụng SPA.
- **Tailwind CSS 3:** Framework CSS utility-first để thiết kế nhanh và responsive.
- **Recharts 3:** Thư viện biểu đồ để hiển thị dữ liệu thống kê.
- **Lucide React:** Thư viện icon đẹp và dễ sử dụng.
- **Axios:** Client HTTP để gọi API.
- **@microsoft/signalr:** Kết nối real-time với backend qua WebSocket.
- **React Hook Form + Zod:** Form validation mạnh mẽ.
- **Zustand:** State management nhẹ và đơn giản.
- **Sonner:** Toast notifications đẹp mắt.
- **DOMPurify:** Sanitize HTML để hiển thị tin nhắn an toàn.
- **jwt-decode:** Decode JWT tokens.

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
- **Google.Apis.Auth:** Xác thực Google OAuth.

## 📁 Cấu trúc dự án

```
LanServe/
├── LanServe-FE/                    # Frontend React
│   ├── src/
│   │   ├── components/             # Các component tái sử dụng
│   │   │   ├── BannerCarousel.jsx  # Carousel banner cho trang chủ
│   │   │   ├── ImageUpload.jsx     # Component upload ảnh
│   │   │   ├── Navbar.jsx          # Navigation bar
│   │   │   ├── NotificationBell.jsx # Notification bell component
│   │   │   ├── Spinner.jsx         # Loading spinner
│   │   │   ├── SearchBar.jsx        # Search bar component
│   │   │   ├── ui/                  # UI components (Button, Input, Card, etc.)
│   │   │   └── ...
│   │   ├── pages/                  # Các trang của ứng dụng
│   │   │   ├── account/            # Trang tài khoản
│   │   │   │   ├── Messages.jsx    # Tin nhắn real-time (SignalR)
│   │   │   │   ├── Projects.jsx    # Quản lý dự án với recommendation
│   │   │   │   ├── Profile.jsx     # Hồ sơ người dùng
│   │   │   │   ├── Settings.jsx    # Cài đặt (avatar, password, notifications)
│   │   │   │   ├── MyProjects.jsx  # Dự án của tôi
│   │   │   │   └── AccountLayout.jsx
│   │   │   ├── admin/              # Trang admin
│   │   │   │   ├── Dashboard.jsx   # Dashboard thống kê với charts
│   │   │   │   ├── Users.jsx        # Quản lý người dùng (CRUD)
│   │   │   │   ├── Projects.jsx     # Quản lý dự án (CRUD)
│   │   │   │   ├── Contracts.jsx   # Quản lý hợp đồng (CRUD)
│   │   │   │   ├── Banners.jsx      # Quản lý banner (CRUD)
│   │   │   │   ├── Statistics.jsx  # Thống kê chi tiết
│   │   │   │   ├── Settings.jsx    # Cài đặt admin
│   │   │   │   └── AdminLayout.jsx
│   │   │   ├── auth/               # Authentication
│   │   │   │   ├── Login.jsx       # Đăng nhập
│   │   │   │   └── Register.jsx    # Đăng ký
│   │   │   ├── freelancer/         # Trang freelancer
│   │   │   │   ├── Intro.jsx        # Giới thiệu
│   │   │   │   ├── Services.jsx     # Dịch vụ
│   │   │   │   ├── Portfolio.jsx   # Portfolio
│   │   │   │   └── Reviews.jsx      # Đánh giá
│   │   │   ├── payment/            # Payment pages
│   │   │   │   ├── PaymentSuccess.jsx
│   │   │   │   └── PaymentFailed.jsx
│   │   │   ├── wallet/             # Wallet pages
│   │   │   │   └── WalletPage.jsx  # Trang ví điện tử
│   │   │   ├── Home.jsx            # Trang chủ với banner carousel
│   │   │   ├── NewProject.jsx      # Tạo dự án mới
│   │   │   ├── UserSearch.jsx      # Tìm kiếm người dùng
│   │   │   └── HowItWorks.jsx      # Hướng dẫn
│   │   ├── lib/                    # Utilities và helpers
│   │   │   ├── api.js              # API client (axios instance)
│   │   │   └── axios.js            # Axios configuration
│   │   ├── services/               # Services
│   │   │   └── signalrClient.js    # SignalR client cho notifications
│   │   ├── stores/                 # Zustand stores
│   │   │   ├── notificationStore.js # Notification state management
│   │   │   └── walletStore.js      # Wallet state management
│   │   └── App.jsx                 # Main app component với routing
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
│   │   │   ├── AuthController.cs   # Authentication (login, register, Google OAuth, forgot password)
│   │   │   ├── ProjectsController.cs # Project CRUD, recommendations
│   │   │   ├── ProposalsController.cs # Proposal CRUD, accept, cancel, edit
│   │   │   ├── MessagesController.cs # Message CRUD, conversations, read/unread
│   │   │   ├── PaymentsController.cs # Payment (VNPAY topup, return URL)
│   │   │   ├── WalletsController.cs # Wallet balance, transactions, payout
│   │   │   ├── ContractsController.cs # Contract CRUD
│   │   │   ├── BannersController.cs # Banner CRUD
│   │   │   ├── UsersController.cs  # User CRUD, settings
│   │   │   ├── UserProfilesController.cs # User profile CRUD
│   │   │   ├── CategoriesController.cs # Category CRUD
│   │   │   ├── SkillsController.cs # Skill CRUD
│   │   │   ├── ReviewsController.cs # Review CRUD
│   │   │   ├── NotificationsController.cs # Notification CRUD
│   │   │   ├── ImagesController.cs # Image upload (single, multiple)
│   │   │   └── HealthController.cs # Health check
│   │   ├── Hubs/                   # SignalR Hubs
│   │   │   ├── MessageHub.cs       # Real-time messaging
│   │   │   ├── NotificationHub.cs  # Real-time notifications
│   │   │   └── CustomUserIdProvider.cs # Custom user ID provider
│   │   ├── Services/               # API Services
│   │   │   └── SignalRRealtimeService.cs # SignalR real-time service wrapper
│   │   ├── Program.cs              # Startup configuration
│   │   └── appsettings.json        # Configuration
│   │
│   ├── LanServe.Application/       # Application Layer
│   │   ├── Services/               # Business logic services
│   │   │   ├── ProjectService.cs   # Project business logic + recommendation algorithm
│   │   │   ├── MessageService.cs   # Message business logic
│   │   │   ├── PaymentService.cs   # Payment business logic (VNPAY)
│   │   │   ├── WalletService.cs    # Wallet business logic
│   │   │   ├── ProposalService.cs   # Proposal business logic
│   │   │   ├── ContractService.cs  # Contract business logic
│   │   │   ├── BannerService.cs    # Banner business logic
│   │   │   ├── UserService.cs      # User business logic
│   │   │   ├── UserProfileService.cs # User profile business logic
│   │   │   ├── NotificationService.cs # Notification business logic
│   │   │   └── ...
│   │   ├── Interfaces/             # Service interfaces
│   │   │   ├── Services/           # Service contracts
│   │   │   │   ├── IProjectService.cs
│   │   │   │   ├── IGeminiService.cs # Gemini AI service interface
│   │   │   │   ├── IVectorService.cs # Vector similarity service interface
│   │   │   │   ├── IImageUploadService.cs # Image upload service interface
│   │   │   │   └── ...
│   │   │   └── Repositories/       # Repository contracts
│   │   │       ├── IProjectRepository.cs
│   │   │       ├── IMessageRepository.cs
│   │   │       └── ...
│   │   └── DTOs/                   # Data Transfer Objects
│   │       └── Messages/          # Message DTOs
│   │
│   ├── LanServe.Domain/            # Domain Layer
│   │   ├── Entities/               # Domain entities
│   │   │   ├── User.cs             # User entity (Id, FullName, Email, Role, AvatarUrl)
│   │   │   ├── UserProfile.cs      # User profile (Bio, Skills, Location, HourlyRate)
│   │   │   ├── Project.cs          # Project entity (Title, Description, Budget, Status, Images, SkillIds)
│   │   │   ├── Proposal.cs         # Proposal entity (ProjectId, FreelancerId, BidAmount, Status)
│   │   │   ├── Contract.cs        # Contract entity (ProjectId, ClientId, FreelancerId, AgreedAmount, Status)
│   │   │   ├── Message.cs          # Message entity (ConversationKey, SenderId, ReceiverId, Text, IsRead)
│   │   │   ├── Notification.cs     # Notification entity (UserId, Type, Title, Message, IsRead)
│   │   │   ├── Payment.cs          # Payment entity (VNPAY fields)
│   │   │   ├── Wallet.cs           # Wallet entity (UserId, Balance)
│   │   │   ├── WalletTransaction.cs # Wallet transaction entity
│   │   │   ├── Review.cs           # Review entity (Rating, Comment)
│   │   │   ├── Banner.cs           # Banner entity (Title, ImageUrl, LinkUrl, IsActive, Order)
│   │   │   ├── Category.cs         # Category entity
│   │   │   ├── Skill.cs            # Skill entity (Name, CategoryId)
│   │   │   ├── ProjectSkill.cs     # Project-Skill relationship
│   │   │   └── UserSettings.cs     # User settings (NotificationSettings, PrivacySettings)
│   │   └── Enums/                  # Domain enums
│   │
│   ├── LanServe.Infrastructure/     # Infrastructure Layer
│   │   ├── Repositories/           # MongoDB repositories
│   │   │   ├── ProjectRepository.cs
│   │   │   ├── MessageRepository.cs
│   │   │   ├── UserRepository.cs
│   │   │   └── ...
│   │   ├── Services/               # Infrastructure services
│   │   │   ├── GeminiService.cs    # Gemini AI integration (skill extraction, embedding)
│   │   │   ├── VectorService.cs    # Vector similarity calculation (cosine similarity)
│   │   │   ├── CloudinaryImageUploadService.cs # Cloudinary image upload
│   │   │   ├── JwtTokenService.cs  # JWT token generation
│   │   │   ├── VnPayService.cs     # VNPAY payment integration
│   │   │   ├── EmailService.cs     # Email service (SMTP)
│   │   │   └── ...
│   │   ├── Data/                   # Data access
│   │   │   ├── MongoDbContext.cs   # MongoDB context
│   │   │   └── MongoOptions.cs     # MongoDB configuration
│   │   └── Initialization/         # DB initialization
│   │       ├── MongoInitializer.cs # MongoDB collection/index initialization
│   │       └── IMongoInitializer.cs
│   │
│   └── LanServe.sln                # Solution file
│
├── .gitignore                       # Git ignore rules
├── README.md                        # This file
└── start-dev.ps1                    # Development startup script (PowerShell)
```

## 🗄️ Database Schema

### Collections chính:
- **Users:** Thông tin người dùng (FullName, Email, PasswordHash, Role, AvatarUrl)
- **UserProfiles:** Hồ sơ chi tiết (Bio, Skills, Location, HourlyRate, SkillEmbedding)
- **Projects:** Dự án (Title, Description, Budget, Status, Images, SkillIds, CategoryId)
- **Proposals:** Đề xuất (ProjectId, FreelancerId, BidAmount, Status, CoverLetter)
- **Contracts:** Hợp đồng (ProjectId, ClientId, FreelancerId, AgreedAmount, Status)
- **Messages:** Tin nhắn (ConversationKey, SenderId, ReceiverId, Text, IsRead, ProjectId)
- **Notifications:** Thông báo (UserId, Type, Title, Message, IsRead, Payload)
- **Payments:** Thanh toán (UserId, Amount, Status, VNPAY fields)
- **Wallets:** Ví điện tử (UserId, Balance)
- **WalletTransactions:** Lịch sử giao dịch ví
- **Reviews:** Đánh giá (ProjectId, ReviewerId, RevieweeId, Rating, Comment)
- **Banners:** Banner (Title, ImageUrl, LinkUrl, IsActive, Order)
- **Categories:** Danh mục (Name)
- **Skills:** Kỹ năng (Name, CategoryId)
- **UserSettings:** Cài đặt người dùng (NotificationSettings, PrivacySettings)

## 🔌 API Endpoints chính

### Authentication:
- `POST /api/auth/register` - Đăng ký tài khoản
- `POST /api/auth/login` - Đăng nhập
- `POST /api/auth/google` - Đăng nhập bằng Google
- `POST /api/auth/forgot-password` - Quên mật khẩu
- `POST /api/auth/reset-password` - Đặt lại mật khẩu

### Projects:
- `GET /api/projects` - Lấy tất cả dự án
- `GET /api/projects/{id}` - Lấy dự án theo ID
- `GET /api/projects/open` - Lấy dự án đang mở
- `GET /api/projects/status/{status}` - Lấy dự án theo trạng thái
- `GET /api/projects/by-owner/{ownerId}` - Lấy dự án theo chủ sở hữu
- `GET /api/projects/recommended` - Lấy dự án được đề xuất (cần đăng nhập)
- `POST /api/projects` - Tạo dự án mới (cần đăng nhập)
- `PUT /api/projects/{id}` - Cập nhật dự án (chỉ owner)
- `DELETE /api/projects/{id}` - Xóa dự án (chỉ Admin)

### Proposals:
- `GET /api/proposals/{id}` - Lấy đề xuất theo ID
- `GET /api/proposals/by-project/{projectId}` - Lấy đề xuất theo dự án
- `GET /api/proposals/by-freelancer/{freelancerId}` - Lấy đề xuất theo freelancer
- `POST /api/proposals` - Tạo đề xuất mới
- `PUT /api/proposals/{id}/status/{status}` - Cập nhật trạng thái đề xuất
- `POST /api/proposals/{id}/accept` - Chấp nhận đề xuất (tạo contract)
- `POST /api/proposals/{id}/cancel` - Hủy đề xuất
- `PUT /api/proposals/{id}/edit` - Chỉnh sửa giá đề xuất

### Messages:
- `GET /api/messages/my` - Lấy tất cả tin nhắn của user
- `GET /api/messages/my-conversations` - Lấy danh sách hội thoại
- `GET /api/messages/thread/{conversationKey}` - Lấy tin nhắn trong hội thoại
- `GET /api/messages/project/{projectId}` - Lấy tin nhắn theo dự án
- `POST /api/messages` - Gửi tin nhắn mới
- `POST /api/messages/{id}/read` - Đánh dấu tin nhắn đã đọc
- `POST /api/messages/conversation/{conversationKey}/read-all` - Đánh dấu tất cả đã đọc

### Payments & Wallets:
- `POST /api/payments/topup` - Tạo URL nạp tiền VNPAY
- `GET /api/payments/vnpay-return` - VNPAY return URL
- `GET /api/wallets/me` - Lấy thông tin ví của tôi
- `GET /api/wallets/{userId}` - Lấy thông tin ví theo userId
- `POST /api/wallets/change-balance` - Thay đổi số dư (nạp/rút)
- `POST /api/wallets/payout` - Thanh toán cho freelancer
- `GET /api/wallets/topups` - Lấy lịch sử nạp tiền

### Banners:
- `GET /api/banners` - Lấy tất cả banner
- `GET /api/banners/active` - Lấy banner đang hoạt động
- `GET /api/banners/{id}` - Lấy banner theo ID
- `POST /api/banners` - Tạo banner mới (Admin)
- `PUT /api/banners/{id}` - Cập nhật banner (Admin)
- `DELETE /api/banners/{id}` - Xóa banner (Admin)

### Images:
- `POST /api/images/upload` - Upload ảnh đơn
- `POST /api/images/upload-multiple` - Upload nhiều ảnh

### Users & Profiles:
- `GET /api/users` - Lấy tất cả người dùng
- `GET /api/users/me` - Lấy thông tin của tôi
- `GET /api/users/{id}` - Lấy người dùng theo ID
- `PUT /api/users/me` - Cập nhật thông tin của tôi
- `PUT /api/users/{id}` - Cập nhật người dùng (Admin)
- `POST /api/users/change-password` - Đổi mật khẩu
- `GET /api/users/me/settings` - Lấy cài đặt của tôi
- `PUT /api/users/me/settings` - Cập nhật cài đặt
- `GET /api/userprofiles/by-user/{userId}` - Lấy profile theo userId
- `PUT /api/userprofiles/{id}` - Cập nhật profile

### SignalR Hubs:
- `/hubs/notification` - Hub cho real-time notifications
- `/hubs/message` - Hub cho real-time messages

## 🔄 Quy trình hoạt động

### 1. Quy trình Đăng dự án:
1. Client đăng nhập
2. Tạo dự án mới với thông tin, hình ảnh, kỹ năng cần thiết
3. Hệ thống gửi notification cho tất cả users (trừ owner)
4. Dự án hiển thị trong danh sách "Đang mở"

### 2. Quy trình Đề xuất:
1. Freelancer xem dự án và gửi đề xuất (cover letter, bid amount)
2. Hệ thống tạo proposal và gửi notification cho client
3. Client xem đề xuất và có thể:
   - Chấp nhận → Tạo contract, cập nhật project status = "InProgress"
   - Từ chối → Proposal status = "Rejected"
   - Freelancer có thể chỉnh sửa giá hoặc hủy đề xuất

### 3. Quy trình Tin nhắn:
1. User A gửi tin nhắn cho User B (có thể liên quan đến project)
2. Hệ thống tạo message và gửi real-time qua SignalR cho cả 2 bên
3. Chat list tự động cập nhật với tin nhắn mới nhất
4. Khi User B mở conversation, tất cả tin nhắn được đánh dấu đã đọc

### 4. Quy trình Thanh toán:
1. User nạp tiền vào ví qua VNPAY
2. VNPAY redirect về `/api/payments/vnpay-return`
3. Backend xác thực và cập nhật số dư ví
4. Client có thể thanh toán cho freelancer qua `/api/wallets/payout`

### 5. Quy trình Đề xuất Dự án (AI Recommendation):
1. User đăng nhập và có profile với skills hoặc bio
2. Hệ thống lấy user skills từ `UserProfile.SkillIds`
3. Nếu có bio, sử dụng Gemini để extract thêm skills
4. So sánh user skills với project skills:
   - Tính số skills match
   - Tính % similarity = (matched skills / total project skills) * 100
   - Bonus 10% nếu category match
   - Capped at 100%
5. Sắp xếp theo similarity và trả về top N dự án

## 🚀 Triển khai

### Frontend:
- **Platform:** Vercel
- **URL:** https://lanserve.vercel.app/
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Framework:** Vite
- **API Proxy:** `/api/*` requests được proxy đến backend Azure qua `vercel.json`
- **SignalR:** Kết nối trực tiếp đến Azure backend (không qua proxy vì WebSocket)

### Backend:
- **Platform:** Azure App Service
- **URL:** https://lanserve-api-cgfghcd9bshbazbd.malaysiawest-01.azurewebsites.net/
- **Runtime:** .NET 8
- **Database:** MongoDB Atlas
- **Swagger:** https://lanserve-api-cgfghcd9bshbazbd.malaysiawest-01.azurewebsites.net/swagger

## 🔐 Truy cập Admin Dashboard

- **URL:** https://lanserve.vercel.app/admin
- **Yêu cầu:** Tài khoản có vai trò "Admin"
- **Tính năng:**
  - Dashboard với thống kê real-time (users, projects, contracts, revenue)
  - Quản lý người dùng (CRUD với pagination, lazy loading)
  - Quản lý dự án (CRUD với pagination, lazy loading)
  - Quản lý hợp đồng (CRUD với pagination, lazy loading)
  - Quản lý banner cho trang chủ (CRUD)
  - Xem thống kê chi tiết với biểu đồ

## 🏁 Bắt đầu phát triển

### Yêu cầu hệ thống:
- **Node.js:** >= 18.x
- **.NET SDK:** >= 8.0
- **MongoDB:** MongoDB Atlas (cloud) hoặc local MongoDB
- **Git:** Để clone repository
- **PowerShell:** (Windows) hoặc Bash (Linux/Mac) để chạy script

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
- Frontend sẽ chạy tại: `http://localhost:5173` (hoặc port khác nếu 5173 bận)

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
cd LanServe.Api
dotnet run
```
- Backend sẽ chạy tại: `http://localhost:5070`
- Swagger UI: `http://localhost:5070/swagger`

4. **Build cho production:**
```bash
dotnet build --configuration Release
```

### Chạy cả Backend và Frontend cùng lúc:

**Windows (PowerShell):**
```powershell
.\start-dev.ps1
```

Script này sẽ mở 2 cửa sổ PowerShell riêng biệt:
- Backend: `http://localhost:5070`
- Frontend: `http://localhost:5173`

### Cấu hình môi trường:

#### Frontend:
Tạo file `.env` trong `LanServe-FE/` (nếu cần):
```env
VITE_API_URL=http://localhost:5070/api
```

#### Backend:
Cấu hình trong `appsettings.json` hoặc `appsettings.Development.json`:

```json
{
  "MongoDb": {
    "ConnectionString": "mongodb+srv://...",
    "DbName": "lanserve"
  },
  "Jwt": {
    "Key": "your-secret-key-here-min-32-chars"
  },
  "Cloudinary": {
    "CloudName": "your-cloud-name",
    "ApiKey": "your-api-key",
    "ApiSecret": "your-api-secret"
  },
  "Gemini": {
    "ApiKey": "your-gemini-api-key"
  },
  "VnPay": {
    "TmnCode": "your-tmn-code",
    "HashSecret": "your-hash-secret",
    "Url": "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    "ReturnUrl": "http://localhost:5070/api/payments/vnpay-return"
  },
  "Email": {
    "SmtpHost": "smtp.gmail.com",
    "SmtpPort": "587",
    "FromEmail": "your-email@gmail.com",
    "FromName": "LanServe",
    "Password": "your-app-password"
  },
  "Frontend": {
    "BaseUrl": "http://localhost:5173"
  }
}
```

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
- `jwt-decode` ^4.0.0
- `dompurify` ^3.2.2
- `sonner` ^1.7.0

### Backend:
- `Microsoft.AspNetCore.Authentication.JwtBearer` ^8.*
- `MongoDB.Driver` ^3.5.0
- `Microsoft.AspNetCore.SignalR` (Real-time)
- `Mapster` ^7.4.0
- `Serilog.AspNetCore` ^9.0.0
- `Swashbuckle.AspNetCore` ^9.0.6
- `BCrypt.Net-Next` ^4.0.3
- `Google.Apis.Auth` ^1.68.0

## 🎯 Tính năng nổi bật

### 1. Real-time Messaging
- Sử dụng SignalR để gửi/nhận tin nhắn real-time
- UI/UX tương tự Facebook Messenger
- Đánh dấu tin nhắn đã đọc/chưa đọc
- Hiển thị số lượng tin nhắn chưa đọc trong chat list
- Chat list tự động cập nhật khi có tin nhắn mới
- Conversation key format: `{projectId}:{userId1}:{userId2}` (userId1 < userId2)

### 2. Hệ thống đề xuất thông minh
- Sử dụng Gemini 2.5 Flash để phân tích kỹ năng từ bio và mô tả dự án
- Tính toán độ tương đồng dựa trên:
  - Skill IDs match (intersection)
  - Category match (bonus 10%)
  - Formula: `similarity = (matched skills / total project skills) * 100 + category bonus`
- Hiển thị phần trăm phù hợp cho mỗi dự án được đề xuất (max 100%)
- Sắp xếp theo độ tương đồng giảm dần
- Lọc bỏ dự án của chính user

### 3. Upload và quản lý ảnh
- Upload ảnh cho dự án (nhiều ảnh)
- Upload avatar cho người dùng
- Sử dụng Cloudinary để lưu trữ và quản lý ảnh
- Hiển thị ảnh trong popup chi tiết dự án
- Validate file type (jpg, jpeg, png, gif, webp)
- Validate file size (max 10MB)

### 4. Banner Management
- Admin có thể quản lý banner hiển thị trên trang chủ
- Carousel tự động chuyển slide
- CRUD đầy đủ cho banner
- Banner có thể có link URL khi click
- Sắp xếp theo thứ tự (Order field)

### 5. Pagination và Lazy Loading
- Infinite scroll cho danh sách dự án, tin nhắn, người dùng
- Loading spinner khi đang tải
- Tối ưu hiệu suất với lazy loading
- Client-side pagination với Intersection Observer API

### 6. Real-time Notifications
- SignalR hub cho notifications
- Các loại notification:
  - `NewProject`: Dự án mới được đăng
  - `NewProposal`: Có đề xuất mới cho dự án
  - `ProposalAccepted`: Đề xuất được chấp nhận
  - `NewMessage`: Tin nhắn mới
- User có thể tắt/bật notifications trong settings

### 7. Payment System
- Tích hợp VNPAY cho nạp tiền vào ví
- Wallet system với balance tracking
- Lịch sử giao dịch (topup history)
- Payout cho freelancer sau khi hoàn thành dự án
- Validate số dư trước khi thanh toán

### 8. Admin Dashboard
- Thống kê real-time:
  - Tổng người dùng (với % thay đổi so với tháng trước)
  - Tổng dự án (với % thay đổi)
  - Tổng hợp đồng (với % thay đổi)
  - Doanh thu (với % thay đổi)
- Biểu đồ doanh thu theo thời gian
- Biểu đồ dự án theo trạng thái
- CRUD đầy đủ cho Users, Projects, Contracts
- Fixed sidebar, scrollable content

## 🔒 Security Features

- **JWT Authentication:** Secure token-based authentication
- **Password Hashing:** BCrypt for password hashing
- **CORS:** Configured CORS policy for allowed origins
- **Authorization:** Role-based access control (User, Admin)
- **Input Validation:** File type and size validation for uploads
- **HTTPS:** Enforced in production
- **SQL Injection Protection:** MongoDB driver handles parameterized queries
- **XSS Protection:** DOMPurify for sanitizing HTML content

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
- VNPAY cho payment gateway

---

**LanServe** - Kết nối tài năng, kiến tạo thành công. 🚀
