using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Repositories
{
    public interface IProposalRepository
    {
        Task<Proposal?> GetByIdAsync(string id);
        Task<IEnumerable<Proposal>> GetByProjectIdAsync(string projectId);
        Task<IEnumerable<Proposal>> GetByFreelancerIdAsync(string freelancerId);
        Task<Proposal> CreateAsync(Proposal entity);
        Task<Proposal?> UpdateStatusAsync(string id, string status);
        Task<bool> DeleteAsync(string id);
        Task<Proposal?> UpdateBidAsync(string proposalId, decimal newBid);

    }
}
