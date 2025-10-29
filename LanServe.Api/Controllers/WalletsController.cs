using System.Security.Claims;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LanServe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WalletsController : ControllerBase
{
    private readonly IWalletService _svc;

    public WalletsController(IWalletService svc) { _svc = svc; }

    // ===== Helpers =====
    private string? GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier);

    // ===== Endpoints =====

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var userId = GetUserId();
        if (string.IsNullOrEmpty(userId)) return Unauthorized();
        var wallet = await _svc.EnsureAsync(userId);
        return Ok(new { wallet.Id, wallet.UserId, wallet.Balance });
    }

    [Authorize]
    [HttpGet("{userId}")]
    public async Task<IActionResult> GetByUserId(string userId)
    {
        var w = await _svc.GetByUserIdAsync(userId);
        return w is null ? NotFound() : Ok(w);
    }

    public record UpdateWalletDto(long Balance);

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] UpdateWalletDto dto)
    {
        var w = await _svc.GetByIdAsync(id);
        if (w is null) return NotFound();
        w.Balance = dto.Balance;
        var ok = await _svc.UpdateAsync(id, w);
        return ok ? Ok(w) : BadRequest(new { message = "Update failed" });
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var ok = await _svc.DeleteAsync(id);
        return ok ? Ok(new { deleted = true }) : NotFound();
    }

    [Authorize]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var wallets = await _svc.GetAllAsync();
        // để FE hiển thị nhẹ
        var list = wallets.Select(w => new { w.Id, w.UserId, w.Balance }).ToList();
        return Ok(list);
    }

    public record ChangeBalanceRequest(long Delta, string? Note);

    /// <summary>
    /// Người dùng tự nạp/rút (delta dương là nạp, âm là rút). Chặn âm quá số dư.
    /// </summary>
    [Authorize]
    [HttpPost("change-balance")]
    public async Task<IActionResult> ChangeBalance([FromBody] ChangeBalanceRequest req)
    {
        var userId = GetUserId();
        if (userId is null) return Unauthorized();

        var (ok, errors, wallet) = await _svc.ChangeBalanceAsync(userId, req.Delta, req.Note);
        if (!ok) return BadRequest(new { message = "Change balance failed", errors });

        return Ok(new { wallet!.Id, wallet!.UserId, wallet!.Balance });
    }
    [Authorize]
    [HttpGet("topups")]
    public async Task<IActionResult> GetTopups(
        [FromQuery] string? userId,
        [FromQuery] int take = 20,
        [FromQuery] string sort = "desc",
        CancellationToken ct = default)
    {
        var uid = string.IsNullOrWhiteSpace(userId) ? GetUserId() : userId;
        if (string.IsNullOrWhiteSpace(uid)) return Unauthorized();

        var asc = string.Equals(sort, "asc", StringComparison.OrdinalIgnoreCase);
        var txns = await _svc.GetTopupHistoryAsync(uid!, take, asc, ct);

        return Ok(txns);
    }
    // LanServe.Api/Controllers/WalletsController.cs

    [Authorize] // có thể siết quyền: chỉ client của contract hoặc Admin
    [HttpPost("payout")]
    public async Task<IActionResult> Payout([FromBody] PayoutRequest req)
    {
        if (req is null || string.IsNullOrWhiteSpace(req.ToUserId) || req.Amount <= 0)
            return BadRequest(new { message = "Invalid payout request" });

        // TODO (khuyến nghị): kiểm tra quyền: currentUserId có phải client của contractId không?

        // cộng tiền cho freelancer
        var (ok, errors, wallet) = await _svc.ChangeBalanceAsync(req.ToUserId, +req.Amount,
            req.Note ?? $"Payout contract {req.ContractId}");
        if (!ok) return BadRequest(new { message = "Payout failed", errors });

        return Ok(new { wallet!.UserId, wallet!.Balance });
    }

    public record PayoutRequest(string ToUserId, long Amount, string? ContractId, string? Note);

}
