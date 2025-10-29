// LanServe.Infrastructure/Data/MongoDbContext.cs
using LanServe.Domain.Entities;
using Microsoft.Extensions.Options;
using MongoDB.Driver;

namespace LanServe.Infrastructure.Data;

public class MongoDbContext
{
    private readonly MongoOptions _opt;
    public IMongoDatabase Database { get; }

    public MongoDbContext(IOptions<MongoOptions> options)
    {
        _opt = options.Value ?? throw new ArgumentNullException(nameof(options));

        if (string.IsNullOrWhiteSpace(_opt.ConnectionString))
            throw new InvalidOperationException("MongoDb:ConnectionString is missing.");
        if (string.IsNullOrWhiteSpace(_opt.DbName))
            throw new InvalidOperationException("MongoDb:DbName is missing.");

        var client = new MongoClient(_opt.ConnectionString);
        Database = client.GetDatabase(_opt.DbName);

        _opt.Collections ??= new MongoOptions.CollectionsSection();
    }

    private IMongoCollection<T> Col<T>(string name) => Database.GetCollection<T>(name);

    public IMongoCollection<User> Users => Col<User>(_opt.Collections.Users);
    public IMongoCollection<UserProfile> UserProfiles => Col<UserProfile>(_opt.Collections.UserProfiles);
    public IMongoCollection<Category> Categories => Col<Category>(_opt.Collections.Categories);
    public IMongoCollection<Skill> Skills => Col<Skill>(_opt.Collections.Skills);
    public IMongoCollection<Project> Projects => Col<Project>(_opt.Collections.Projects);
    public IMongoCollection<ProjectSkill> ProjectSkills => Col<ProjectSkill>(_opt.Collections.ProjectSkills);
    public IMongoCollection<Proposal> Proposals => Col<Proposal>(_opt.Collections.Proposals);
    public IMongoCollection<Contract> Contracts => Col<Contract>(_opt.Collections.Contracts);
    public IMongoCollection<Payment> Payments => Col<Payment>(_opt.Collections.Payments);
    public IMongoCollection<Message> Messages => Col<Message>(_opt.Collections.Messages);
    public IMongoCollection<Notification> Notifications => Col<Notification>(_opt.Collections.Notifications);
    public IMongoCollection<Review> Reviews => Col<Review>(_opt.Collections.Reviews);

    // NEW
    public IMongoCollection<Wallet> Wallets => Col<Wallet>(_opt.Collections.Wallets);
    public IMongoCollection<WalletTransaction> WalletTransactions => Col<WalletTransaction>(_opt.Collections.WalletTransactions);
}
