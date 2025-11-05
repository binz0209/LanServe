using LanServe.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Google.Apis.Auth;
using System.Net.Mail;
using System.Net;

namespace LanServe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IUserService _users;
    private readonly IJwtTokenService _jwt;

    public AuthController(IUserService users, IJwtTokenService jwt)
    {
        _users = users;
        _jwt = jwt;
    }

    public record RegisterRequest(string FullName, string Email, string Password, string Role = "User");

    // ✅ Cập nhật LoginRequest để có RememberMe
    public record LoginRequest(string Email, string Password, bool RememberMe = false);

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterRequest req)
    {
        try
        {
            var user = await _users.RegisterAsync(req.FullName, req.Email, req.Password, req.Role);
            var (token, exp) = _jwt.GenerateToken(user.Id, user.Email, user.Role);
            return Ok(new { accessToken = token, expiresIn = exp });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequest req)
    {
        try
        {
            var user = await _users.ValidateUserAsync(req.Email, req.Password);
            if (user is null)
                return Unauthorized(new { message = "Invalid credentials" });

            // ✅ Gọi GenerateToken với RememberMe
            var (token, exp) = _jwt.GenerateToken(user.Id, user.Email, user.Role, req.RememberMe);

            return Ok(new { accessToken = token, expiresIn = exp });
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ [AuthController.Login] Error: {ex.Message}");
            Console.WriteLine($"❌ [AuthController.Login] StackTrace: {ex.StackTrace}");
            return StatusCode(500, new { message = "Login failed", error = ex.Message });
        }
    }

    [AllowAnonymous]
    [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleLoginRequest req)
    {
        try
        {
            var payload = await GoogleJsonWebSignature.ValidateAsync(req.IdToken, new GoogleJsonWebSignature.ValidationSettings());
            var user = await _users.GetByEmailAsync(payload.Email);
            if (user == null)
            {
                user = await _users.RegisterAsync(
                    payload.Name ?? payload.Email.Split('@')[0],
                    payload.Email,
                    Guid.NewGuid().ToString(),
                    "User"
                );
            }

            // Google login không cần RememberMe — vẫn dùng TTL mặc định
            var (token, exp) = _jwt.GenerateToken(user.Id, user.Email, user.Role);
            return Ok(new { accessToken = token, expiresIn = exp });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = "Google login failed", error = ex.Message });
        }
    }

    public record GoogleLoginRequest(string IdToken);

    public record ForgotPasswordRequest(string Email);
    public record ResetPasswordRequest(string Email, string Code, string NewPassword);
    private static readonly Dictionary<string, (string Code, DateTime Expire)> _resetCodes = new();

    [AllowAnonymous]
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequest req)
    {
        var user = await _users.GetByEmailAsync(req.Email);
        if (user == null)
            return NotFound(new { message = "Email không tồn tại trong hệ thống." });

        // Tạo mã ngẫu nhiên 6 số
        var code = new Random().Next(100000, 999999).ToString();
        _resetCodes[req.Email] = (code, DateTime.UtcNow.AddMinutes(10));

        try
        {
            using var smtp = new SmtpClient("smtp.gmail.com")
            {
                Port = 587,
                Credentials = new NetworkCredential("pvapro123@gmail.com", "jtkx dauy cdmt mysg"), // App password Gmail
                EnableSsl = true
            };

            var msg = new MailMessage("yourgmail@gmail.com", req.Email)
            {
                Subject = "LanServe - Mã khôi phục mật khẩu",
                Body = $"Mã xác thực của bạn là: {code}\nMã này sẽ hết hạn sau 10 phút.",
                IsBodyHtml = false
            };

            await smtp.SendMailAsync(msg);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Không thể gửi email", error = ex.Message });
        }

        return Ok(new { message = "Mã xác thực đã được gửi về email." });
    }

    [AllowAnonymous]
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequest req)
    {
        if (!_resetCodes.TryGetValue(req.Email, out var data))
            return BadRequest(new { message = "Chưa yêu cầu đặt lại mật khẩu." });

        if (data.Expire < DateTime.UtcNow)
        {
            _resetCodes.Remove(req.Email);
            return BadRequest(new { message = "Mã xác thực đã hết hạn." });
        }

        if (data.Code != req.Code)
            return BadRequest(new { message = "Mã xác thực không đúng." });

        var user = await _users.GetByEmailAsync(req.Email);
        if (user == null)
            return NotFound(new { message = "Không tìm thấy người dùng." });

        await _users.UpdatePasswordAsync(user.Id, req.NewPassword);
        _resetCodes.Remove(req.Email);

        return Ok(new { message = "Mật khẩu đã được đặt lại thành công." });
    }
}
