# Script để chạy Backend và Frontend trên 2 PowerShell riêng biệt

Write-Host "🚀 Đang khởi động LanServe Backend và Frontend..." -ForegroundColor Green
Write-Host ""

# Lấy đường dẫn hiện tại
$rootPath = $PSScriptRoot
$bePath = Join-Path $rootPath "LanServe-BE\LanServe.Api"
$fePath = Join-Path $rootPath "LanServe-FE"

# Kiểm tra thư mục tồn tại
if (-not (Test-Path $bePath)) {
    Write-Host "❌ Không tìm thấy thư mục Backend: $bePath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $fePath)) {
    Write-Host "❌ Không tìm thấy thư mục Frontend: $fePath" -ForegroundColor Red
    exit 1
}

# Khởi động Backend trong cửa sổ PowerShell mới
Write-Host "📦 Đang khởi động Backend (.NET)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$bePath'; Write-Host '🔷 LanServe Backend - Port 5070' -ForegroundColor Blue; Write-Host ''; dotnet run"
) -WindowStyle Normal

# Đợi một chút để backend bắt đầu
Start-Sleep -Seconds 3

# Khởi động Frontend trong cửa sổ PowerShell mới
Write-Host "⚛️  Đang khởi động Frontend (React + Vite)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList @(
    "-NoExit",
    "-Command",
    "cd '$fePath'; Write-Host '🔷 LanServe Frontend - Port 5173' -ForegroundColor Green; Write-Host ''; npm run dev"
) -WindowStyle Normal

Write-Host ""
Write-Host "✅ Đã mở 2 cửa sổ PowerShell riêng biệt:" -ForegroundColor Green
Write-Host "   - Backend: http://localhost:5070" -ForegroundColor Yellow
Write-Host "   - Frontend: http://localhost:5173" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Đóng cửa sổ này không ảnh hưởng đến Backend và Frontend" -ForegroundColor Gray

