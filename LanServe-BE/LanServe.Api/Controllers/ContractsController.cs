using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LanServe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContractsController : ControllerBase
{
    private readonly IContractService _svc;
    public ContractsController(IContractService svc) { _svc = svc; }

    [Authorize]
    [HttpGet("{id}")] public async Task<IActionResult> GetById(string id) => Ok(await _svc.GetByIdAsync(id));

    [Authorize]
    [HttpGet("by-client/{clientId}")]
    public async Task<IActionResult> ByClient(string clientId) => Ok(await _svc.GetByClientIdAsync(clientId));

    [Authorize]
    [HttpGet("by-freelancer/{freelancerId}")]
    public async Task<IActionResult> ByFreelancer(string freelancerId) => Ok(await _svc.GetByFreelancerIdAsync(freelancerId));

    [Authorize(Roles = "User,Admin")]
    [HttpPost] public async Task<IActionResult> Create([FromBody] Contract dto) => Ok(await _svc.CreateAsync(dto));

    [Authorize(Roles = "User,Admin")]
    [HttpPut("{id}")] public async Task<IActionResult> Update(string id, [FromBody] Contract dto) => Ok(await _svc.UpdateAsync(id, dto));

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")] public async Task<IActionResult> Delete(string id) => Ok(await _svc.DeleteAsync(id));

    [Authorize(Roles = "Admin")]
    [HttpGet] public async Task<IActionResult> GetAll() => Ok(await _svc.GetAllAsync());

    [Authorize(Roles = "User,Admin")]
    [HttpPost("{id}/complete")]
    public async Task<IActionResult> CompleteContract(string id)
    {
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

        if (string.IsNullOrEmpty(userId))
            return Unauthorized("User ID not found in token");

        var result = await _svc.CompleteContractAsync(id, userId);
        
        if (!result.Success)
            return BadRequest(new { message = result.Message });

        return Ok(new { message = result.Message });
    }
}
