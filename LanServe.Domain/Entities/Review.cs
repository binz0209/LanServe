// LanServe.Domain/Entities/Review.cs
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LanServe.Domain.Entities;

public class Review
{
    [BsonId, BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("projectId"), BsonRepresentation(BsonType.ObjectId)]
    public string ProjectId { get; set; } = null!;

    [BsonElement("reviewerId"), BsonRepresentation(BsonType.ObjectId)]
    public string ReviewerId { get; set; } = null!;

    [BsonElement("revieweeId"), BsonRepresentation(BsonType.ObjectId)]
    public string RevieweeId { get; set; } = null!;

    [BsonElement("rating")]
    public int Rating { get; set; } // 1..5

    [BsonElement("comment")]
    public string? Comment { get; set; }

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
