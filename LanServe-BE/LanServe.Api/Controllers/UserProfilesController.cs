using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LanServe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class UserProfilesController : ControllerBase
{
    private readonly IUserProfileService _svc;
    public UserProfilesController(IUserProfileService svc) { _svc = svc; }

    [Authorize]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id) => Ok(await _svc.GetByIdAsync(id));

    [Authorize] 
    [HttpGet("by-user/{userId}")]
    public async Task<IActionResult> GetByUser(string userId)   
    {
        var profile = await _svc.GetByUserIdAsync(userId);
        if (profile == null) return NotFound();
        return Ok(profile);
    }
        

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] UserProfile dto) => Ok(await _svc.CreateAsync(dto));

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UserProfile dto)
    {
        var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(currentUserId)) return Unauthorized();

        var profile = await _svc.GetByIdAsync(id);
        if (profile == null) return NotFound();

        if (profile.UserId != currentUserId && !User.IsInRole("Admin"))
            return Forbid();

        var updated = await _svc.UpdateAsync(id, dto);
        return Ok(updated);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id) => Ok(await _svc.DeleteAsync(id));
    [Authorize]

    [HttpGet("all")]
    public async Task<IActionResult> GetAll()
    {
        var profiles = await _svc.GetAllAsync();
        return Ok(profiles);
    }


}
