// LanServe.Application/DTOs/Messages/ProposalMessageCreateDto.cs
namespace LanServe.Application.DTOs.Messages;

public class ProposalMessageCreateDto
{
    public string ProjectId { get; set; } = null!;
    public string ProposalId { get; set; } = null!;
    public string ClientId { get; set; } = null!;
    public string FreelancerId { get; set; } = null!;

    // Dùng để đặt title/snippet đẹp
    public string ProjectTitle { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public string FreelancerName { get; set; } = string.Empty;

    // Nội dung đề xuất
    public string CoverLetter { get; set; } = string.Empty;
    public decimal? BidAmount { get; set; }
}
