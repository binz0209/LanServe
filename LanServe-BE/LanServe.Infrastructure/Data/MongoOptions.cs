// LanServe.Infrastructure/Data/MongoOptions.cs
namespace LanServe.Infrastructure.Data;

public class MongoOptions
{
    public string ConnectionString { get; set; } = "mongodb://localhost:27017";
    public string DbName { get; set; } = "LanServeDev";
    public CollectionsSection Collections { get; set; } = new();

    public class CollectionsSection
    {
        public string Users { get; set; } = "users";
        public string UserProfiles { get; set; } = "user_profiles";
        public string Projects { get; set; } = "projects";
        public string ProjectSkills { get; set; } = "project_skills";
        public string Proposals { get; set; } = "proposals";
        public string Contracts { get; set; } = "contracts";
        public string Payments { get; set; } = "payments";
        public string Reviews { get; set; } = "reviews";
        public string Messages { get; set; } = "messages";
        public string Notifications { get; set; } = "notifications";
        public string Categories { get; set; } = "categories";
        public string Skills { get; set; } = "skills";

        // NEW
        public string Wallets { get; set; } = "wallets";
        public string WalletTransactions { get; set; } = "wallet_transactions";
    }
}
