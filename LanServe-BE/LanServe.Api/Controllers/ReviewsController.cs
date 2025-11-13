using LanServe.Application.DTOs;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

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
    [HttpGet("check/{projectId}")]
    public async Task<IActionResult> CheckReview(string projectId)
    {
        var reviewerId = User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? User.FindFirst("sub")?.Value
            ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

        if (string.IsNullOrEmpty(reviewerId))
            return Unauthorized("User ID not found in token");

        var reviews = await _svc.GetByProjectIdAsync(projectId);
        var existingReview = reviews.FirstOrDefault(r => r.ReviewerId == reviewerId);
        var hasReviewed = existingReview != null;

        return Ok(new { hasReviewed, review = existingReview });
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CreateReviewDto dto)
    {
        try
        {
            // Lấy reviewerId từ JWT token
            var reviewerId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirst("sub")?.Value
                ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

            if (string.IsNullOrEmpty(reviewerId))
                return Unauthorized("User ID not found in token");

            // Tạo Review entity từ DTO
            var review = new Review
            {
                ProjectId = dto.ProjectId,
                ReviewerId = reviewerId,
                RevieweeId = dto.RevieweeId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = DateTime.UtcNow
            };

            return Ok(await _svc.CreateAsync(review));
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    [Authorize(Roles = "Admin")]
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(string id) => Ok(await _svc.DeleteAsync(id));
}
