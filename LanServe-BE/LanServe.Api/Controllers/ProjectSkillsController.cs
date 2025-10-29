using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LanServe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectSkillsController : ControllerBase
{
    private readonly IProjectSkillService _svc;
    public ProjectSkillsController(IProjectSkillService svc) { _svc = svc; }

    // Lấy tất cả kỹ năng của 1 project
    [AllowAnonymous]
    [HttpGet("by-project/{projectId}")]
    public async Task<IActionResult> ByProject(string projectId)
        => Ok(await _svc.GetByProjectIdAsync(projectId));

    // Lấy tất cả project có skillId cụ thể
    [AllowAnonymous]
    [HttpGet("by-skill/{skillId}")]
    public async Task<IActionResult> BySkill(string skillId)
        => Ok(await _svc.GetBySkillIdAsync(skillId));

    // Thêm 1 ProjectSkill (chỉ cần ProjectId + SkillId)
    [Authorize(Roles = "Admin,User")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] ProjectSkill dto)
    {
        if (string.IsNullOrWhiteSpace(dto.ProjectId) || string.IsNullOrWhiteSpace(dto.SkillId))
            return BadRequest("ProjectId và SkillId là bắt buộc");
        return Ok(await _svc.CreateAsync(dto));
    }

    // Xoá 1 ProjectSkill
    [Authorize(Roles = "Admin,User")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
        => Ok(await _svc.DeleteAsync(id));

    // Đồng bộ danh sách skill của project (thêm mới + xoá thừa)
    [Authorize(Roles = "Admin,User")]
    [HttpPost("sync")]
    public async Task<IActionResult> Sync([FromBody] SyncRequest req)
    {
        if (req == null || string.IsNullOrWhiteSpace(req.ProjectId))
            return BadRequest("ProjectId là bắt buộc");

        var (added, removed) = await _svc.SyncForProjectAsync(req.ProjectId, req.SkillIds ?? Enumerable.Empty<string>());
        return Ok(new { added, removed });
    }

    public class SyncRequest
    {
        public string ProjectId { get; set; } = null!;
        public List<string>? SkillIds { get; set; }
    }
}
