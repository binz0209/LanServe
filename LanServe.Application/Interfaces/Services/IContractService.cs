using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Services;

public interface IContractService
{
    Task<Contract?> GetByIdAsync(string id);
    Task<IEnumerable<Contract>> GetByClientIdAsync(string clientId);
    Task<IEnumerable<Contract>> GetByFreelancerIdAsync(string freelancerId);
    Task<Contract> CreateAsync(Contract entity);
    Task<bool> UpdateAsync(string id, Contract entity);
    Task<bool> DeleteAsync(string id);
}
