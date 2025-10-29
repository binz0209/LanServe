using LanServe.Application.Interfaces.Repositories;
using LanServe.Domain.Entities;
using MongoDB.Driver;

namespace LanServe.Infrastructure.Repositories;

public class UserProfileRepository : IUserProfileRepository
{
    private readonly IMongoCollection<UserProfile> _collection;

    public UserProfileRepository(IMongoCollection<UserProfile> collection)
    {
        _collection = collection;
    }

    public async Task<UserProfile?> GetByIdAsync(string id)
        => await _collection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task<UserProfile?> GetByUserIdAsync(string userId)
        => await _collection.Find(x => x.UserId == userId).FirstOrDefaultAsync();

    public async Task<UserProfile> InsertAsync(UserProfile entity)
    {
        await _collection.InsertOneAsync(entity);
        return entity;
    }

    public async Task<bool> UpdateAsync(UserProfile entity)
    {
        var result = await _collection.ReplaceOneAsync(x => x.Id == entity.Id, entity);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _collection.DeleteOneAsync(x => x.Id == id);
        return result.DeletedCount > 0;
    }
    public async Task<IEnumerable<UserProfile>> GetAllAsync()
    {
        return await _collection.Find(_ => true).ToListAsync();
    }
}
