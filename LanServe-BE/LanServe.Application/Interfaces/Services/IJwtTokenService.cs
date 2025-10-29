namespace LanServe.Application.Interfaces.Services;

public interface IJwtTokenService
{
    (string accessToken, int expiresIn) GenerateToken(string userId, string email, string role);
}
