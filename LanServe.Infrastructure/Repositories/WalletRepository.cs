using LanServe.Application.Interfaces.Repositories;
using LanServe.Domain.Entities;
using MongoDB.Driver;

namespace LanServe.Infrastructure.Repositories;

public class WalletRepository : IWalletRepository
{
    private readonly IMongoCollection<Wallet> _collection;

    public WalletRepository(IMongoCollection<Wallet> collection)
    {
        _collection = collection;
    }

    public async Task<IEnumerable<Wallet>> GetAllAsync()
        => await _collection.Find(_ => true).ToListAsync();

    public async Task<Wallet?> GetByIdAsync(string id)
        => await _collection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task<Wallet?> GetByUserIdAsync(string userId)
        => await _collection.Find(x => x.UserId == userId).FirstOrDefaultAsync();

    public async Task<Wallet> InsertAsync(Wallet entity)
    {
        await _collection.InsertOneAsync(entity);
        return entity;
    }
    
    public async Task<bool> UpdateAsync(Wallet entity, CancellationToken ct = default)
    {
        var res = await _collection.ReplaceOneAsync(x => x.Id == entity.Id, entity, cancellationToken: ct);
        return res.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _collection.DeleteOneAsync(x => x.Id == id);
        return result.DeletedCount > 0;
    }
    public async Task<Wallet> GetOrCreateByUserAsync(string userId, CancellationToken ct = default)
    {
        // Atomic upsert theo userId
        var now = DateTime.UtcNow;

        var filter = Builders<Wallet>.Filter.Eq(x => x.UserId, userId);
        var update = Builders<Wallet>.Update
            .SetOnInsert(x => x.UserId, userId)
            .SetOnInsert(x => x.Balance, 0)
            .SetOnInsert(x => x.CreatedAt, now)
            .Set(x => x.UpdatedAt, now);

        var opts = new FindOneAndUpdateOptions<Wallet>
        {
            IsUpsert = true,
            ReturnDocument = ReturnDocument.After
        };

        return await _collection.FindOneAndUpdateAsync(filter, update, opts, ct);
    }
}
