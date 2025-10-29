// LanServe.Domain/Entities/Contract.cs
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LanServe.Domain.Entities;

public class Contract
{
    [BsonId, BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("projectId"), BsonRepresentation(BsonType.ObjectId)]
    public string ProjectId { get; set; } = null!;

    [BsonElement("clientId"), BsonRepresentation(BsonType.ObjectId)]
    public string ClientId { get; set; } = null!;

    [BsonElement("freelancerId"), BsonRepresentation(BsonType.ObjectId)]
    public string FreelancerId { get; set; } = null!;

    [BsonElement("agreedAmount")]
    public decimal AgreedAmount { get; set; }

    [BsonElement("status")]
    public string Status { get; set; } = "Active"; // Active/Completed/Cancelled

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
