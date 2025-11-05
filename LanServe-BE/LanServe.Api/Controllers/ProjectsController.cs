using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System.Text.Json;

namespace LanServe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _svc;
    private readonly INotificationService _notificationService;
    private readonly IUserService _userService;
    private readonly IUserSettingsService _userSettingsService;

    public ProjectsController(
        IProjectService svc,
        INotificationService notificationService,
        IUserService userService,
        IUserSettingsService userSettingsService)
    {
        _svc = svc;
        _notificationService = notificationService;
        _userService = userService;
        _userSettingsService = userSettingsService;
    }

    [AllowAnonymous]
    [HttpGet("{id}")] public async Task<IActionResult> GetById(string id) => Ok(await _svc.GetByIdAsync(id));

    [AllowAnonymous]
    [HttpGet("open")] public async Task<IActionResult> Open() => Ok(await _svc.GetOpenProjectsAsync());

    [Authorize]
    [HttpGet("by-owner/{ownerId}")]
    public async Task<IActionResult> ByOwner(string ownerId) => Ok(await _svc.GetByOwnerIdAsync(ownerId));

    [Authorize(Roles = "User,Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Project dto)
    {
        var created = await _svc.CreateAsync(dto);
        
        // 🔔 Gửi notification "dự án mới" cho tất cả users (trừ owner)
        try
        {
            Console.WriteLine($"📩 [ProjectsController.Create] Starting notification creation for project: {created.Id}");
            
            // Lấy danh sách tất cả users
            var allUsers = await _userService.GetAllAsync();
            
            var ownerId = created.OwnerId;
            var owner = await _userService.GetByIdAsync(ownerId);
            var ownerName = owner?.FullName ?? "Người dùng";
            
            Console.WriteLine($"📩 [ProjectsController.Create] Found {allUsers.Count()} users. Owner: {ownerName}");
            
            foreach (var user in allUsers)
            {
                // Bỏ qua owner
                if (user.Id == ownerId)
                    continue;

                // Kiểm tra settings
                var userSettings = await _userSettingsService.GetByUserIdAsync(user.Id);
                if (userSettings?.NotificationSettings?.NewProjectNotifications == false)
                {
                    Console.WriteLine($"⚠️ [ProjectsController.Create] User {user.Id} has new project notifications disabled. Skipping.");
                    continue;
                }

                var payload = JsonSerializer.Serialize(new
                {
                    projectId = created.Id,
                    projectTitle = created.Title,
                    ownerId = ownerId,
                    ownerName = ownerName,
                    action = "NewProject"
                });

                var notification = new Notification
                {
                    UserId = user.Id,
                    Type = "NewProject",
                    Title = "Dự án mới",
                    Message = $"{ownerName} đã đăng dự án mới: {created.Title}",
                    Payload = payload,
                    CreatedAt = DateTime.UtcNow
                };

                await _notificationService.CreateAsync(notification);
                Console.WriteLine($"✅ [ProjectsController.Create] Notification sent to user {user.Id}");
            }
            
            Console.WriteLine($"✅ [ProjectsController.Create] Notifications sent successfully");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"❌ [ProjectsController.Create] Failed to send project notifications: {ex.Message}");
            Console.WriteLine($"❌ [ProjectsController.Create] Stack trace: {ex.StackTrace}");
        }

        return Ok(created);
    }

    [Authorize] // chỉ cần đăng nhập
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] Project dto)
    {
        // lấy userId từ JWT
        var currentUserId =
            User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

        if (string.IsNullOrEmpty(currentUserId))
            return Unauthorized();

        // lấy project hiện tại
        var existing = await _svc.GetByIdAsync(id);
        if (existing is null) return NotFound();

        // chỉ owner mới được sửa
        if (!string.Equals(existing.OwnerId, currentUserId, StringComparison.Ordinal))
            return Forbid(); // 403

        // gán lại Id để chắc chắn update đúng bản ghi
        dto.Id = id;
        // (tuỳ bạn: có thể chặn đổi OwnerId, CreatedAt, v.v.)
        dto.OwnerId = existing.OwnerId;
        dto.CreatedAt = existing.CreatedAt;

        var updated = await _svc.UpdateAsync(id, dto);
        return Ok(updated);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")] public async Task<IActionResult> Delete(string id) => Ok(await _svc.DeleteAsync(id));

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _svc.GetAllAsync());

    [AllowAnonymous]
    [HttpGet("status/{status}")]
    public async Task<IActionResult> ByStatus(string status)
        => Ok(await _svc.GetByStatusAsync(status));
}
