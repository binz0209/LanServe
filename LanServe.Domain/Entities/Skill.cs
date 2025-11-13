// LanServe.Domain/Entities/Skill.cs
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LanServe.Domain.Entities;

public class Skill
{
    [BsonId, BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("name")]
    public string Name { get; set; } = string.Empty;

    [BsonElement("categoryId"), BsonRepresentation(BsonType.ObjectId)]
    public string? CategoryId { get; set; }
}
