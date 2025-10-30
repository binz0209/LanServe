using System.Security.Claims;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LanServe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _svc;
    public NotificationsController(INotificationService svc)
    {
        _svc = svc;
    }

    private string? GetUserId()
        => User.FindFirstValue(ClaimTypes.NameIdentifier)
           ?? User.FindFirst("sub")?.Value
           ?? User.FindFirst("userId")?.Value
           ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

    // ✅ Lấy thông báo của user hiện tại
    [HttpGet("my")]
    public async Task<IActionResult> My()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized();

        var list = await _svc.GetByUserAsync(userId);
        // Trả theo thứ tự mới nhất
        return Ok(list.OrderByDescending(n => n.CreatedAt));
    }

    // ✅ Lấy thông báo của user bất kỳ (dành cho Admin)
    [Authorize(Roles = "Admin")]
    [HttpGet("by-user/{userId}")]
    public async Task<IActionResult> ByUser(string userId)
        => Ok(await _svc.GetByUserAsync(userId));

    // ✅ Tạo mới (nếu cần cho test thủ công)
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Notification dto)
        => Ok(await _svc.CreateAsync(dto));

    // ✅ Đánh dấu đã đọc
    [HttpPost("{id}/read")]
    public async Task<IActionResult> MarkRead(string id)
        => Ok(await _svc.MarkAsReadAsync(id));

    // ✅ Xóa (chỉ Admin)
    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
        => Ok(await _svc.DeleteAsync(id));
}
