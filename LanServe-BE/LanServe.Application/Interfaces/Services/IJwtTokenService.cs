namespace LanServe.Application.Interfaces.Services
{
    public interface IJwtTokenService
    {
        // ✅ Thêm tham số rememberMe tùy chọn
        (string accessToken, int expiresIn) GenerateToken(string userId, string email, string role, bool rememberMe = false);
    }
}
