using System.Security.Claims;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LanServe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UsersController : ControllerBase
{
    private readonly IUserService _svc;
    private readonly IUserSettingsService _settingsSvc;
    
    public UsersController(IUserService svc, IUserSettingsService settingsSvc)
    {
        _svc = svc;
        _settingsSvc = settingsSvc;
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(id)) return Unauthorized();
        var me = await _svc.GetByIdAsync(id);
        return Ok(me);
    }
    [Authorize]
    //[Authorize(Roles = "Admin")]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id) => Ok(await _svc.GetByIdAsync(id));

    public record UpdateUserDto(string? FullName, string? Role, string? AvatarUrl);
    
    [Authorize]
    [HttpPut("me")]
    public async Task<IActionResult> UpdateMe([FromBody] UpdateUserDto dto)
    {
        var id = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(id)) return Unauthorized();
        
        var u = await _svc.GetByIdAsync(id);
        if (u is null) return NotFound();
        
        if (!string.IsNullOrEmpty(dto.FullName)) u.FullName = dto.FullName;
        if (!string.IsNullOrEmpty(dto.AvatarUrl)) u.AvatarUrl = dto.AvatarUrl;
        
        return Ok(await _svc.UpdateAsync(id, u));
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateUserDto dto)
    {
        var u = await _svc.GetByIdAsync(id);
        if (u is null) return NotFound();
        if (!string.IsNullOrEmpty(dto.FullName)) u.FullName = dto.FullName;
        if (!string.IsNullOrEmpty(dto.Role)) u.Role = dto.Role;
        if (!string.IsNullOrEmpty(dto.AvatarUrl)) u.AvatarUrl = dto.AvatarUrl;
        return Ok(await _svc.UpdateAsync(id, u));
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id) => Ok(await _svc.DeleteAsync(id));

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var users = await _svc.GetAllAsync();
        // chỉ trả về thông tin cơ bản để chat
        var list = users.Select(u => new { u.Id, u.FullName, u.Email }).ToList();
        return Ok(list);
    }


    public record ChangePasswordRequest(string OldPassword, string NewPassword);

    public record UpdateNotificationSettingsRequest(bool EmailNotifications, bool MessageNotifications, bool NewProjectNotifications);

    public record UpdatePrivacySettingsRequest(bool PublicProfile, bool ShowOnlineStatus);

    public record UpdateUserSettingsRequest(
        NotificationSettingsDto? NotificationSettings,
        PrivacySettingsDto? PrivacySettings
    );

    public record NotificationSettingsDto(bool EmailNotifications, bool MessageNotifications, bool NewProjectNotifications);

    public record PrivacySettingsDto(bool PublicProfile, bool ShowOnlineStatus);

    [Authorize]
    [HttpGet("me/settings")]
    public async Task<IActionResult> GetUserSettings()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var settings = await _settingsSvc.EnsureAsync(userId);
        return Ok(settings);
    }

    [Authorize]
    [HttpPut("me/settings")]
    public async Task<IActionResult> UpdateUserSettings([FromBody] UpdateUserSettingsRequest dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var settings = await _settingsSvc.EnsureAsync(userId);

        // Update notification settings if provided
        if (dto.NotificationSettings != null)
        {
            settings.NotificationSettings = new NotificationSettings
            {
                EmailNotifications = dto.NotificationSettings.EmailNotifications,
                MessageNotifications = dto.NotificationSettings.MessageNotifications,
                NewProjectNotifications = dto.NotificationSettings.NewProjectNotifications
            };
        }

        // Update privacy settings if provided
        if (dto.PrivacySettings != null)
        {
            settings.PrivacySettings = new PrivacySettings
            {
                PublicProfile = dto.PrivacySettings.PublicProfile,
                ShowOnlineStatus = dto.PrivacySettings.ShowOnlineStatus
            };
        }

        await _settingsSvc.UpdateAsync(settings.Id, settings);
        return Ok(settings);
    }

    [Authorize]
    [HttpPut("me/notification-settings")]
    public async Task<IActionResult> UpdateNotificationSettings([FromBody] UpdateNotificationSettingsRequest dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var notificationSettings = new NotificationSettings
        {
            EmailNotifications = dto.EmailNotifications,
            MessageNotifications = dto.MessageNotifications,
            NewProjectNotifications = dto.NewProjectNotifications
        };

        var settings = await _settingsSvc.UpdateNotificationSettingsAsync(userId, notificationSettings);
        return Ok(settings.NotificationSettings);
    }

    [Authorize]
    [HttpPut("me/privacy-settings")]
    public async Task<IActionResult> UpdatePrivacySettings([FromBody] UpdatePrivacySettingsRequest dto)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        var privacySettings = new PrivacySettings
        {
            PublicProfile = dto.PublicProfile,
            ShowOnlineStatus = dto.ShowOnlineStatus
        };

        var settings = await _settingsSvc.UpdatePrivacySettingsAsync(userId, privacySettings);
        return Ok(settings.PrivacySettings);
    }

    [Authorize]
    [HttpPost("change-password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest req)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null) return Unauthorized();

        var result = await _svc.ChangePasswordAsync(userId, req.OldPassword, req.NewPassword);

        if (!result.Succeeded)
            return BadRequest(new { message = "Password change failed", errors = result.Errors });

        return Ok(new { message = "Password changed successfully" });
    }
}
