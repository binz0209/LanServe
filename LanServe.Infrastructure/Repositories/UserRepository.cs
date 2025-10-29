using LanServe.Application.Interfaces.Repositories;
using LanServe.Domain.Entities;
using MongoDB.Driver;

namespace LanServe.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly IMongoCollection<User> _collection;

    public UserRepository(IMongoCollection<User> collection)
    {
        _collection = collection;
    }

    public async Task<IEnumerable<User>> GetAllAsync()
        => await _collection.Find(_ => true).ToListAsync();

    public async Task<User?> GetByIdAsync(string id)
        => await _collection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task<User?> GetByEmailAsync(string email)
        => await _collection.Find(x => x.Email == email).FirstOrDefaultAsync();

    public async Task<User> InsertAsync(User entity)
    {
        await _collection.InsertOneAsync(entity);
        return entity;
    }

    public async Task<bool> UpdateAsync(User entity)
    {
        var result = await _collection.ReplaceOneAsync(x => x.Id == entity.Id, entity);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _collection.DeleteOneAsync(x => x.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<bool> UpdatePasswordAsync(string id, string hashedPassword)
    {
        var update = Builders<User>.Update.Set(u => u.PasswordHash, hashedPassword);
        var result = await _collection.UpdateOneAsync(u => u.Id == id, update);
        return result.ModifiedCount > 0;
    }
}
