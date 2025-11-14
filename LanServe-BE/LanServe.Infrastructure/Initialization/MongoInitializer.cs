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
        await EnsureCollection(_opt.Collections.UserSettings);
        await EnsureCollection(_opt.Collections.Banners);

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

        // ===== Indexes cho UserSettings =====
        var userSettings = _ctx.Database.GetCollection<BsonDocument>(_opt.Collections.UserSettings);
        await userSettings.Indexes.CreateOneAsync(
            new CreateIndexModel<BsonDocument>(
                Builders<BsonDocument>.IndexKeys.Ascending("userId"),
                new CreateIndexOptions { Name = "ux_user_settings_userId", Unique = true }),
            cancellationToken: ct);

        // ===== Data Migration: user.userSettings -> user_settings collection =====
        await MigrateUserSettingsToCollectionAsync(ct);

        _logger.LogInformation("Mongo initialization finished for {Db}", _opt.DbName);
    }

    private async Task MigrateUserSettingsToCollectionAsync(CancellationToken ct)
    {
        try
        {
            var usersCollection = _ctx.Database.GetCollection<BsonDocument>(_opt.Collections.Users);
            var userSettingsCollection = _ctx.Database.GetCollection<BsonDocument>(_opt.Collections.UserSettings);
            
            // Tìm tất cả users
            var allUsers = await usersCollection.Find(_ => true).ToListAsync(ct);
            
            if (allUsers.Count == 0)
            {
                _logger.LogInformation("No users to migrate");
                return;
            }

            _logger.LogInformation("Found {Count} users to migrate to user_settings collection", allUsers.Count);

            int migratedCount = 0;
            int createdCount = 0;
            int skippedCount = 0;
            
            foreach (var userDoc in allUsers)
            {
                try
                {
                    if (!userDoc.TryGetValue("_id", out var idValue) || idValue == null || idValue.IsBsonNull)
                    {
                        skippedCount++;
                        continue;
                    }

                    string userId;
                    if (idValue.IsObjectId)
                        userId = idValue.AsObjectId.ToString();
                    else if (idValue.IsString)
                        userId = idValue.AsString;
                    else
                        userId = idValue.ToString();
                    
                    // Kiểm tra xem đã có UserSettings trong collection riêng chưa
                    var existingSettings = await userSettingsCollection
                        .Find(Builders<BsonDocument>.Filter.Eq("userId", userId))
                        .FirstOrDefaultAsync(ct);
                    
                    if (existingSettings != null)
                    {
                        skippedCount++;
                        continue;
                    }

                    userDoc.TryGetValue("userSettings", out var embeddedSettingsValue);
                    userDoc.TryGetValue("notificationSettings", out var embeddedNotificationValue);

                    var userSettingsDoc = embeddedSettingsValue != null && embeddedSettingsValue.IsBsonDocument
                        ? embeddedSettingsValue.AsBsonDocument
                        : null;
                    var notificationSettingsDoc = embeddedNotificationValue != null && embeddedNotificationValue.IsBsonDocument
                        ? embeddedNotificationValue.AsBsonDocument
                        : null;
                    
                    BsonDocument newUserSettings;

                    if (userSettingsDoc != null)
                    {
                        // Migrate từ userSettings embedded
                        newUserSettings = new BsonDocument
                        {
                            ["userId"] = userId,
                            ["notificationSettings"] = userSettingsDoc.GetValue("notificationSettings", new BsonDocument()).AsBsonDocument,
                            ["privacySettings"] = userSettingsDoc.Contains("privacySettings") 
                                ? userSettingsDoc["privacySettings"].AsBsonDocument
                                : (userSettingsDoc.Contains("privacySetting") 
                                    ? userSettingsDoc["privacySetting"].AsBsonDocument
                                    : new BsonDocument
                                    {
                                        ["publicProfile"] = true,
                                        ["showOnlineStatus"] = false
                                    }),
                            ["createdAt"] = DateTime.UtcNow,
                            ["updatedAt"] = DateTime.UtcNow
                        };
                        migratedCount++;
                    }
                    else if (notificationSettingsDoc != null)
                    {
                        // Migrate từ notificationSettings cũ
                        newUserSettings = new BsonDocument
                        {
                            ["userId"] = userId,
                            ["notificationSettings"] = new BsonDocument
                            {
                                ["emailNotifications"] = notificationSettingsDoc.GetValue("emailNotifications", true).AsBoolean,
                                ["messageNotifications"] = notificationSettingsDoc.GetValue("messageNotifications", true).AsBoolean,
                                ["newProjectNotifications"] = notificationSettingsDoc.GetValue("newProjectNotifications", true).AsBoolean
                            },
                            ["privacySettings"] = new BsonDocument
                            {
                                ["publicProfile"] = true,
                                ["showOnlineStatus"] = false
                            },
                            ["createdAt"] = DateTime.UtcNow,
                            ["updatedAt"] = DateTime.UtcNow
                        };
                        migratedCount++;
                    }
                    else
                    {
                        // Tạo mới với default values
                        newUserSettings = new BsonDocument
                        {
                            ["userId"] = userId,
                            ["notificationSettings"] = new BsonDocument
                            {
                                ["emailNotifications"] = true,
                                ["messageNotifications"] = true,
                                ["newProjectNotifications"] = true
                            },
                            ["privacySettings"] = new BsonDocument
                            {
                                ["publicProfile"] = true,
                                ["showOnlineStatus"] = false
                            },
                            ["createdAt"] = DateTime.UtcNow,
                            ["updatedAt"] = DateTime.UtcNow
                        };
                        createdCount++;
                    }

                    // Insert vào collection user_settings
                    await userSettingsCollection.InsertOneAsync(newUserSettings, cancellationToken: ct);

                    // Xóa userSettings và notificationSettings khỏi user document
                    var updateFilter = Builders<BsonDocument>.Filter.Eq("_id", idValue);
                    var update = Builders<BsonDocument>.Update
                        .Unset("userSettings")
                        .Unset("notificationSettings");
                    await usersCollection.UpdateOneAsync(updateFilter, update, cancellationToken: ct);

                    _logger.LogDebug("Migrated user {UserId} to user_settings collection", userId);
                }
                catch (Exception ex)
                {
                    string userIdForLog = "unknown";
                    if (userDoc.TryGetValue("_id", out var idValueForLog) && idValueForLog != null && !idValueForLog.IsBsonNull)
                    {
                        if (idValueForLog.IsObjectId)
                            userIdForLog = idValueForLog.AsObjectId.ToString();
                        else if (idValueForLog.IsString)
                            userIdForLog = idValueForLog.AsString;
                        else
                            userIdForLog = idValueForLog.ToString();
                    }
                    _logger.LogWarning(ex, "Failed to migrate user {UserId}", userIdForLog);
                }
            }

            _logger.LogInformation(
                "Migration completed: {MigratedCount} migrated from embedded, {CreatedCount} created with defaults, {SkippedCount} already exist, {TotalCount} total processed",
                migratedCount, createdCount, skippedCount, allUsers.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during user settings migration to collection");
        }
    }
}
