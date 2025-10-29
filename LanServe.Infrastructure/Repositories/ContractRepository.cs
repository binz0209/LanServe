using LanServe.Application.Interfaces.Repositories;
using LanServe.Domain.Entities;
using MongoDB.Driver;

namespace LanServe.Infrastructure.Repositories;

public class ContractRepository : IContractRepository
{
    private readonly IMongoCollection<Contract> _collection;

    public ContractRepository(IMongoCollection<Contract> collection)
    {
        _collection = collection;
    }

    public async Task<Contract?> GetByIdAsync(string id)
        => await _collection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task<IEnumerable<Contract>> GetByClientIdAsync(string clientId)
        => await _collection.Find(x => x.ClientId == clientId).ToListAsync();

    public async Task<IEnumerable<Contract>> GetByFreelancerIdAsync(string freelancerId)
        => await _collection.Find(x => x.FreelancerId == freelancerId).ToListAsync();

    public async Task<IEnumerable<Contract>> GetAllAsync()
        => await _collection.Find(_ => true).ToListAsync();

    public async Task<Contract> InsertAsync(Contract entity)
    {
        await _collection.InsertOneAsync(entity);
        return entity;
    }

    public async Task<bool> UpdateAsync(Contract entity)
    {
        var result = await _collection.ReplaceOneAsync(x => x.Id == entity.Id, entity);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _collection.DeleteOneAsync(x => x.Id == id);
        return result.DeletedCount > 0;
    }
}
