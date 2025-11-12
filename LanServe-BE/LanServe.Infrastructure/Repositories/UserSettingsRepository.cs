using LanServe.Application.Interfaces.Repositories;
using LanServe.Domain.Entities;
using MongoDB.Driver;

namespace LanServe.Infrastructure.Repositories;

public class UserSettingsRepository : IUserSettingsRepository
{
    private readonly IMongoCollection<UserSettings> _collection;

    public UserSettingsRepository(IMongoCollection<UserSettings> collection)
    {
        _collection = collection;
    }

    public async Task<IEnumerable<UserSettings>> GetAllAsync()
        => await _collection.Find(_ => true).ToListAsync();

    public async Task<UserSettings?> GetByIdAsync(string id)
        => await _collection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task<UserSettings?> GetByUserIdAsync(string userId)
        => await _collection.Find(x => x.UserId == userId).FirstOrDefaultAsync();

    public async Task<UserSettings> InsertAsync(UserSettings entity)
    {
        entity.CreatedAt = DateTime.UtcNow;
        entity.UpdatedAt = DateTime.UtcNow;
        await _collection.InsertOneAsync(entity);
        return entity;
    }
    
    public async Task<bool> UpdateAsync(UserSettings entity, CancellationToken ct = default)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        var res = await _collection.ReplaceOneAsync(x => x.Id == entity.Id, entity, cancellationToken: ct);
        return res.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _collection.DeleteOneAsync(x => x.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<UserSettings> GetOrCreateByUserAsync(string userId, CancellationToken ct = default)
    {
        // Atomic upsert theo userId
        var now = DateTime.UtcNow;

        var filter = Builders<UserSettings>.Filter.Eq(x => x.UserId, userId);
        var update = Builders<UserSettings>.Update
            .SetOnInsert(x => x.UserId, userId)
            .SetOnInsert(x => x.NotificationSettings, new NotificationSettings())
            .SetOnInsert(x => x.PrivacySettings, new PrivacySettings())
            .SetOnInsert(x => x.CreatedAt, now)
            .Set(x => x.UpdatedAt, now);

        var opts = new FindOneAndUpdateOptions<UserSettings>
        {
            IsUpsert = true,
            ReturnDocument = ReturnDocument.After
        };

        return await _collection.FindOneAndUpdateAsync(filter, update, opts, ct);
    }
}

