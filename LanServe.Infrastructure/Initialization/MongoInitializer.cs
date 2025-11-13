// LanServe.Infrastructure/Initialization/MongoInitializer.cs
using LanServe.Infrastructure.Data;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;

namespace LanServe.Infrastructure.Initialization;

public class MongoInitializer : IMongoInitializer
{
    private readonly MongoDbContext _ctx;
    private readonly MongoOptions _opt;
    private readonly ILogger<MongoInitializer> _logger;

    public MongoInitializer(MongoDbContext ctx, IOptions<MongoOptions> opt, ILogger<MongoInitializer> logger)
    {
        _ctx = ctx;
        _opt = opt.Value;
        _logger = logger;
    }

    public async Task InitializeAsync(CancellationToken ct = default)
    {
        await _ctx.Database.RunCommandAsync((Command<BsonDocument>)"{ ping: 1 }", cancellationToken: ct);
        _logger.LogInformation("Mongo ping OK on {Db}", _opt.DbName);

        var existing = await _ctx.Database.ListCollectionNames().ToListAsync(ct);
        async Task EnsureCollection(string name)
        {
            if (!existing.Contains(name))
            {
                await _ctx.Database.CreateCollectionAsync(name, cancellationToken: ct);
                _logger.LogInformation("Created collection: {Name}", name);
            }
        }

        // Existing
        await EnsureCollection(_opt.Collections.Users);
        await EnsureCollection(_opt.Collections.UserProfiles);
        await EnsureCollection(_opt.Collections.Projects);
        await EnsureCollection(_opt.Collections.ProjectSkills);
        await EnsureCollection(_opt.Collections.Proposals);
        await EnsureCollection(_opt.Collections.Contracts);
        await EnsureCollection(_opt.Collections.Payments);
        await EnsureCollection(_opt.Collections.Reviews);
        await EnsureCollection(_opt.Collections.Messages);
        await EnsureCollection(_opt.Collections.Notifications);
        await EnsureCollection(_opt.Collections.Categories);
        await EnsureCollection(_opt.Collections.Skills);

        // NEW
        await EnsureCollection(_opt.Collections.Wallets);
        await EnsureCollection(_opt.Collections.WalletTransactions);

        // ===== Indexes =====

        // Payments: unique vnp_TxnRef + search helpers
        var payments = _ctx.Database.GetCollection<BsonDocument>(_opt.Collections.Payments);
        await payments.Indexes.CreateManyAsync(new[]
        {
            new CreateIndexModel<BsonDocument>(
                Builders<BsonDocument>.IndexKeys.Ascending("vnp_TxnRef"),
                new CreateIndexOptions { Name = "ux_payments_vnp_TxnRef", Unique = true }),
            new CreateIndexModel<BsonDocument>(
                Builders<BsonDocument>.IndexKeys.Ascending("userId").Ascending("createdAt"),
                new CreateIndexOptions { Name = "ix_payments_user_created" }),
            new CreateIndexModel<BsonDocument>(
                Builders<BsonDocument>.IndexKeys.Ascending("status"),
                new CreateIndexOptions { Name = "ix_payments_status" })
        }, cancellationToken: ct);

        // Wallets: unique per user
        var wallets = _ctx.Database.GetCollection<BsonDocument>(_opt.Collections.Wallets);
        await wallets.Indexes.CreateOneAsync(
            new CreateIndexModel<BsonDocument>(
                Builders<BsonDocument>.IndexKeys.Ascending("userId"),
                new CreateIndexOptions { Name = "ux_wallets_userId", Unique = true }),
            cancellationToken: ct);

        // WalletTransactions: filter by wallet, createdAt
        var walletTxns = _ctx.Database.GetCollection<BsonDocument>(_opt.Collections.WalletTransactions);
        await walletTxns.Indexes.CreateManyAsync(new[]
        {
            new CreateIndexModel<BsonDocument>(
                Builders<BsonDocument>.IndexKeys.Ascending("walletId").Ascending("createdAt"),
                new CreateIndexOptions { Name = "ix_wallettxns_wallet_created" }),
            new CreateIndexModel<BsonDocument>(
                Builders<BsonDocument>.IndexKeys.Ascending("userId").Ascending("createdAt"),
                new CreateIndexOptions { Name = "ix_wallettxns_user_created" })
        }, cancellationToken: ct);

        _logger.LogInformation("Mongo initialization finished for {Db}", _opt.DbName);
    }
}
