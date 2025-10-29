using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LanServe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly IReviewService _svc;
    public ReviewsController(IReviewService svc) { _svc = svc; }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id) => Ok(await _svc.GetByIdAsync(id));

    [AllowAnonymous]
    [HttpGet("by-project/{projectId}")]
    public async Task<IActionResult> ByProject(string projectId) => Ok(await _svc.GetByProjectIdAsync(projectId));

    [AllowAnonymous]
    [HttpGet("by-user/{userId}")]
    public async Task<IActionResult> ByUser(string userId) => Ok(await _svc.GetByUserAsync(userId));

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Review dto) => Ok(await _svc.CreateAsync(dto));

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id) => Ok(await _svc.DeleteAsync(id));
}
