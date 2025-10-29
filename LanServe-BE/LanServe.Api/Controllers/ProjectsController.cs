using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LanServe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _svc;
    public ProjectsController(IProjectService svc) { _svc = svc; }

    [AllowAnonymous]
    [HttpGet("{id}")] public async Task<IActionResult> GetById(string id) => Ok(await _svc.GetByIdAsync(id));

    [AllowAnonymous]
    [HttpGet("open")] public async Task<IActionResult> Open() => Ok(await _svc.GetOpenProjectsAsync());

    [Authorize]
    [HttpGet("by-owner/{ownerId}")]
    public async Task<IActionResult> ByOwner(string ownerId) => Ok(await _svc.GetByOwnerIdAsync(ownerId));

    [Authorize(Roles = "User,Admin")]
    [HttpPost] public async Task<IActionResult> Create([FromBody] Project dto) => Ok(await _svc.CreateAsync(dto));

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
