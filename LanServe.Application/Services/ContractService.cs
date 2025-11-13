using LanServe.Application.Interfaces.Repositories;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;

namespace LanServe.Application.Services;

public class ContractService : IContractService
{
    private readonly IContractRepository _repo;

    public ContractService(IContractRepository repo)
    {
        _repo = repo;
    }

    public Task<Contract?> GetByIdAsync(string id)
        => _repo.GetByIdAsync(id);

    public Task<IEnumerable<Contract>> GetByClientIdAsync(string clientId)
        => _repo.GetByClientIdAsync(clientId);

    public Task<IEnumerable<Contract>> GetByFreelancerIdAsync(string freelancerId)
        => _repo.GetByFreelancerIdAsync(freelancerId);

    public Task<Contract> CreateAsync(Contract entity)
        => _repo.InsertAsync(entity);

    public async Task<bool> UpdateAsync(string id, Contract entity)
    {
        entity.Id = id;
        return await _repo.UpdateAsync(entity);
    }

    public Task<bool> DeleteAsync(string id)
        => _repo.DeleteAsync(id);
}
