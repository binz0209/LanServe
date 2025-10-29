using LanServe.Application.Interfaces.Repositories;
using LanServe.Domain.Entities;
using MongoDB.Driver;

namespace LanServe.Infrastructure.Repositories;

public class WalletTransactionRepository : IWalletTransactionRepository
{
    private readonly IMongoCollection<WalletTransaction> _col;

    public WalletTransactionRepository(IMongoCollection<WalletTransaction> collection)
    {
        _col = collection;

        // Index tối ưu truy vấn: (userId, type, createdAt)
        try
        {
            var model = new CreateIndexModel<WalletTransaction>(
                Builders<WalletTransaction>.IndexKeys
                    .Ascending(x => x.UserId)
                    .Ascending(x => x.Type)
                    .Descending(x => x.CreatedAt),
                new CreateIndexOptions { Name = "ix_walletTxns_user_type_createdAt" }
            );
            _col.Indexes.CreateOne(model);
        }
        catch { /* ignore nếu đã tồn tại khác tên */ }
    }

    public async Task InsertAsync(WalletTransaction entity, CancellationToken ct = default)
    {
        if (entity.CreatedAt == default) entity.CreatedAt = DateTime.UtcNow;
        await _col.InsertOneAsync(entity, cancellationToken: ct);
    }

    public async Task<IReadOnlyList<WalletTransaction>> GetHistoryByUserAsync(
        string userId, int take = 20, bool asc = false, CancellationToken ct = default)
    {
        take = Math.Clamp(take, 1, 100);
        var filter = Builders<WalletTransaction>.Filter.Eq(x => x.UserId, userId);
        var sort = asc
            ? Builders<WalletTransaction>.Sort.Ascending(x => x.CreatedAt)
            : Builders<WalletTransaction>.Sort.Descending(x => x.CreatedAt);

        var list = await _col.Find(filter).Sort(sort).Limit(take).ToListAsync(ct);
        return list;
    }

    public async Task<IReadOnlyList<WalletTransaction>> GetTopupsByUserAsync(
        string userId, int take = 20, bool asc = false, CancellationToken ct = default)
    {
        take = Math.Clamp(take, 1, 100);
        var filter = Builders<WalletTransaction>.Filter.And(
            Builders<WalletTransaction>.Filter.Eq(x => x.UserId, userId),
            Builders<WalletTransaction>.Filter.Eq(x => x.Type, "TopUp")
        );
        var sort = asc
            ? Builders<WalletTransaction>.Sort.Ascending(x => x.CreatedAt)
            : Builders<WalletTransaction>.Sort.Descending(x => x.CreatedAt);

        var list = await _col.Find(filter).Sort(sort).Limit(take).ToListAsync(ct);
        return list;
    }
}
