using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Services
{
    public interface IProposalService
    {
        Task<Proposal?> GetByIdAsync(string id);
        Task<IEnumerable<Proposal>> GetByProjectIdAsync(string projectId);
        Task<IEnumerable<Proposal>> GetByFreelancerIdAsync(string freelancerId);
        Task<Proposal> CreateAsync(Proposal entity);
        Task<Proposal?> UpdateStatusAsync(string id, string status);
        Task<bool> DeleteAsync(string id);
        Task<Proposal?> UpdateBidAsync(string proposalId, decimal newBid);
        Task<string?> GetProjectOwnerAsync(string projectId);
        Task<Proposal?> UpdateBidAndRefreshMessageAsync(string proposalId, decimal newBid);
        Task<Proposal?> CancelAndRefreshMessageAsync(string proposalId);
        Task<Message> CreateAcceptedMessageAsync(Proposal proposal, Contract contract);
    }
}
