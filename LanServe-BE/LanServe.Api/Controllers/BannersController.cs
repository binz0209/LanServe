using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LanServe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BannersController : ControllerBase
{
    private readonly IBannerService _bannerService;

    public BannersController(IBannerService bannerService)
    {
        _bannerService = bannerService;
    }

    [AllowAnonymous]
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var banners = await _bannerService.GetAllBannersAsync();
        return Ok(banners);
    }

    [AllowAnonymous]
    [HttpGet("active")]
    public async Task<IActionResult> GetActiveBanners()
    {
        var banners = await _bannerService.GetActiveBannersAsync();
        return Ok(banners);
    }

    [AllowAnonymous]
    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(string id)
    {
        var banner = await _bannerService.GetBannerByIdAsync(id);
        if (banner == null) return NotFound();
        return Ok(banner);
    }

    [Authorize(Roles = "Admin")]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] Banner banner)
    {
        if (banner == null)
            return BadRequest("Banner data is required");

        if (string.IsNullOrWhiteSpace(banner.Title))
            return BadRequest("Title is required");

        if (string.IsNullOrWhiteSpace(banner.ImageUrl))
            return BadRequest("ImageUrl is required");

        // Đảm bảo Id là null khi tạo mới (MongoDB sẽ tự tạo)
        banner.Id = null;
        var created = await _bannerService.CreateBannerAsync(banner);
        return Ok(created);
    }

    [Authorize(Roles = "Admin")]
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(string id, [FromBody] Banner banner)
    {
        banner.Id = id;
        var updated = await _bannerService.UpdateBannerAsync(banner);
        if (!updated) return NotFound();
        return Ok(banner);
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id)
    {
        var deleted = await _bannerService.DeleteBannerAsync(id);
        if (!deleted) return NotFound();
        return Ok(new { message = "Banner deleted successfully" });
    }
}


