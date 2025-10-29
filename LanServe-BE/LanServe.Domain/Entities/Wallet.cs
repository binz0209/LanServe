// LanServe.Domain/Entities/Wallet.cs
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LanServe.Domain.Entities;

public class Wallet
{
    [BsonId, BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("userId"), BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = null!;

    [BsonElement("balance")]
    public long Balance { get; set; } = 0; // VND

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
