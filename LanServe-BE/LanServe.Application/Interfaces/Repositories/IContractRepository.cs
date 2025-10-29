using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Repositories;

public interface IContractRepository
{
    Task<Contract?> GetByIdAsync(string id);
    Task<IEnumerable<Contract>> GetByClientIdAsync(string clientId);
    Task<IEnumerable<Contract>> GetByFreelancerIdAsync(string freelancerId);
    Task<Contract> InsertAsync(Contract entity);
    Task<bool> UpdateAsync(Contract entity);
    Task<bool> DeleteAsync(string id);
}
