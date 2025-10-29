using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using LanServe.Infrastructure.Data;
using MongoDB.Driver;

namespace LanServe.Api.Controllers;

[ApiController]
[Route("health")]
public class HealthController : ControllerBase
{
    // 1) Chỉ đọc config thô, KHÔNG inject MongoDbContext ở action này
    [HttpGet("config")]
    public IActionResult Config([FromServices] IOptions<MongoOptions> opt, [FromServices] IConfiguration cfg)
    {
        var o = opt.Value;
        return Ok(new
        {
            ok = true,
            env = cfg["ASPNETCORE_ENVIRONMENT"],
            mongo = new
            {
                hasConn = !string.IsNullOrWhiteSpace(o.ConnectionString),
                hasDb = !string.IsNullOrWhiteSpace(o.DbName),
                dbName = o.DbName
            },
            jwtKeySet = !string.IsNullOrWhiteSpace(cfg["Jwt:Key"])
        });
    }

    // 2) Kiểm tra Mongo có try/catch – nếu fail, trả 500 nhưng KHÔNG nổ unhandled
    [HttpGet("mongo")]
    public async Task<IActionResult> Mongo([FromServices] MongoDbContext db)
    {
        try
        {
            var names = await db.Database.ListCollectionNames().ToListAsync();
            return Ok(new { ok = true, collections = names });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { ok = false, error = ex.Message });
        }
    }

    // 3) Alias /health -> /health/config cho dễ gọi
    [HttpGet]
    public IActionResult Root([FromServices] IOptions<MongoOptions> opt, [FromServices] IConfiguration cfg)
        => Config(opt, cfg);
}
