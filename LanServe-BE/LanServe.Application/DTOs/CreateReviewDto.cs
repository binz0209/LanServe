// LanServe.Application/DTOs/CreateReviewDto.cs
namespace LanServe.Application.DTOs;

public class CreateReviewDto
{
    public string ProjectId { get; set; } = null!;
    public string RevieweeId { get; set; } = null!;
    public int Rating { get; set; }
    public string? Comment { get; set; }
}

