using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LanServe.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace LanServe.Infrastructure.Services;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _config;

    public JwtTokenService(IConfiguration config)
    {
        _config = config;
    }

    public (string accessToken, int expiresIn) GenerateToken(string userId, string email, string role)
    {
        var key = _config["Jwt:Key"];
        var issuer = _config["Jwt:Issuer"] ?? "LanServe";
        var audience = _config["Jwt:Audience"] ?? "LanServeClient";
        var expires = DateTime.UtcNow.AddHours(2);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, userId),
            new Claim(ClaimTypes.Email, email),
            new Claim(ClaimTypes.Role, role)
        };

        var creds = new SigningCredentials(
            new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key!)),
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: expires,
            signingCredentials: creds
        );

        return (new JwtSecurityTokenHandler().WriteToken(token),
                (int)(expires - DateTime.UtcNow).TotalSeconds);
    }
}
