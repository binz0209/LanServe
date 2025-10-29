using LanServe.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LanServe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly IPaymentService _paymentService;
    private readonly ILogger<PaymentsController> _logger;
    private readonly IConfiguration _config;

    public PaymentsController(IPaymentService paymentService, ILogger<PaymentsController> logger,
        IConfiguration config)
    {
        _paymentService = paymentService;
        _logger = logger;
        _config = config;
    }

    // 1) Tạo URL nạp tiền (topup) qua VNPAY
    [HttpPost("topup")]
    public async Task<IActionResult> CreateTopup([FromBody] TopupRequest req, CancellationToken ct)
    {
        // TODO: Lấy userId từ JWT ở thực tế; ở đây nhận từ body để dev/test
        if (req.Amount <= 0) return BadRequest("Amount must be > 0");
        var ip = HttpContext.Connection.RemoteIpAddress?.ToString() ?? "0.0.0.0";
        var url = await _paymentService.CreateTopUpAsync(req.UserId, req.Amount, ip, ct);
        return Ok(new { paymentUrl = url });
    }

    // 2) VNPAY Return URL
    [HttpGet("vnpay-return")]
    public async Task<IActionResult> VnPayReturn(CancellationToken ct)
    {
        var queryParams = Request.Query.ToDictionary(k => k.Key, v => v.Value.ToString());
        var (ok, redirectPath) = await _paymentService.HandleVnPayReturnAsync(queryParams, ct);
        if (!ok) _logger.LogWarning("VNPAY return failed: {Query}", Request.QueryString.Value);

        // Ghép domain FE nếu nhận về path tương đối
        var feBase = _config["Frontend:BaseUrl"] ?? "http://localhost:5173";
        var finalUrl = redirectPath.StartsWith("/")
            ? feBase.TrimEnd('/') + redirectPath
            : redirectPath;

        return Redirect(finalUrl);
    }

    [Authorize(Roles = "Admin")]
    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _paymentService.GetAllAsync());

    public record TopupRequest(string UserId, decimal Amount);
}
