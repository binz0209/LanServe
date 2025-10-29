// LanServe.Domain/Entities/WalletTransaction.cs
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LanServe.Domain.Entities;

public class WalletTransaction
{
    [BsonId, BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("walletId"), BsonRepresentation(BsonType.ObjectId)]
    public string WalletId { get; set; } = null!;

    [BsonElement("userId"), BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = null!;

    [BsonElement("paymentId"), BsonRepresentation(BsonType.ObjectId)]
    public string? PaymentId { get; set; }

    [BsonElement("type")] // TopUp/Withdraw/Hold/Release
    public string Type { get; set; } = "TopUp";

    [BsonElement("amount")]
    public long Amount { get; set; }

    [BsonElement("balanceAfter")]
    public long BalanceAfter { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("note")]
    public string? Note { get; set; }
}
