using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LanServe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SkillsController : ControllerBase
{
    private readonly ISkillService _svc;
    public SkillsController(ISkillService svc) { _svc = svc; }

    [AllowAnonymous]
    [HttpGet] public async Task<IActionResult> GetAll() => Ok(await _svc.GetAllAsync());

    [AllowAnonymous]
    [HttpGet("by-category/{categoryId}")]
    public async Task<IActionResult> ByCategory(string categoryId) => Ok(await _svc.GetByCategoryIdAsync(categoryId));

    [AllowAnonymous]
    [HttpGet("{id}")] public async Task<IActionResult> GetById(string id) => Ok(await _svc.GetByIdAsync(id));

    [Authorize(Roles = "Admin")]
    [HttpPost] public async Task<IActionResult> Create([FromBody] Skill dto) => Ok(await _svc.CreateAsync(dto));

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")] public async Task<IActionResult> Update(string id, [FromBody] Skill dto) => Ok(await _svc.UpdateAsync(id, dto));

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")] public async Task<IActionResult> Delete(string id) => Ok(await _svc.DeleteAsync(id));

    [AllowAnonymous]
    [HttpPost("resolve")]
    public async Task<IActionResult> Resolve([FromBody] List<string> ids)
    {
        if (ids == null || ids.Count == 0) return Ok(new List<object>());

        var skills = await _svc.GetByIdsAsync(ids);
        return Ok(skills.Select(s => new { s.Id, s.Name }));
    }

}
