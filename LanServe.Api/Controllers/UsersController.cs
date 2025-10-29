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
    public UsersController(IUserService svc) { _svc = svc; }

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

    public record UpdateUserDto(string FullName, string Role);
    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateUserDto dto)
    {
        var u = await _svc.GetByIdAsync(id);
        if (u is null) return NotFound();
        u.FullName = dto.FullName; u.Role = dto.Role;
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
