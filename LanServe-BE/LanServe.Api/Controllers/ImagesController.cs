using LanServe.Application.Interfaces.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LanServe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ImagesController : ControllerBase
{
    private readonly IImageUploadService _imageUploadService;

    public ImagesController(IImageUploadService imageUploadService)
    {
        _imageUploadService = imageUploadService;
    }

    [Authorize]
    [HttpPost("upload")]
    public async Task<IActionResult> UploadImage(IFormFile file, [FromQuery] string folder = "lanserve")
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { message = "No file uploaded" });

        // Validate file type
        var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!allowedExtensions.Contains(fileExtension))
            return BadRequest(new { message = "Invalid file type. Allowed: jpg, jpeg, png, gif, webp" });

        // Validate file size (max 10MB)
        if (file.Length > 10 * 1024 * 1024)
            return BadRequest(new { message = "File size exceeds 10MB limit" });

        try
        {
            using var stream = file.OpenReadStream();
            var imageUrl = await _imageUploadService.UploadImageAsync(stream, file.FileName, folder);
            return Ok(new { url = imageUrl });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Upload failed", error = ex.Message });
        }
    }

    [Authorize]
    [HttpPost("upload-multiple")]
    public async Task<IActionResult> UploadMultipleImages(IFormFileCollection files, [FromQuery] string folder = "lanserve")
    {
        if (files == null || files.Count == 0)
            return BadRequest(new { message = "No files uploaded" });

        var uploadedUrls = new List<string>();
        var errors = new List<string>();

        foreach (var file in files)
        {
            if (file.Length == 0) continue;

            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
            {
                errors.Add($"{file.FileName}: Invalid file type");
                continue;
            }

            if (file.Length > 10 * 1024 * 1024)
            {
                errors.Add($"{file.FileName}: File size exceeds 10MB");
                continue;
            }

            try
            {
                using var stream = file.OpenReadStream();
                var imageUrl = await _imageUploadService.UploadImageAsync(stream, file.FileName, folder);
                uploadedUrls.Add(imageUrl);
            }
            catch (Exception ex)
            {
                errors.Add($"{file.FileName}: {ex.Message}");
            }
        }

        return Ok(new { urls = uploadedUrls, errors });
    }
}


