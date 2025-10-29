// LanServe.Application/Dtos/CreateProposalDto.cs
namespace LanServe.Application.DTOs;

public class CreateProposalDto
{
    public string ProjectId { get; set; } = null!;
    public string FreelancerId { get; set; } = null!;
    public string? CoverLetter { get; set; }
    public decimal? BidAmount { get; set; }
}
