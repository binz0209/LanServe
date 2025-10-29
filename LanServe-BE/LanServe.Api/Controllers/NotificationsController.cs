using System.Security.Claims;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LanServe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NotificationsController : ControllerBase
{
    private readonly INotificationService _svc;
    public NotificationsController(INotificationService svc) { _svc = svc; }

    [Authorize]
    [HttpGet("mine")]
    public async Task<IActionResult> Mine()
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();
        return Ok(await _svc.GetByUserAsync(userId));
    }

    [Authorize]
    [HttpGet("by-user/{userId}")]
    public async Task<IActionResult> ByUser(string userId) => Ok(await _svc.GetByUserAsync(userId));

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Notification dto) => Ok(await _svc.CreateAsync(dto));

    [Authorize]
    [HttpPost("{id}/read")]
    public async Task<IActionResult> MarkRead(string id) => Ok(await _svc.MarkAsReadAsync(id));

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id) => Ok(await _svc.DeleteAsync(id));
}
