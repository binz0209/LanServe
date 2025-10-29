// LanServe.Domain/Entities/UserProfile.cs
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LanServe.Domain.Entities;

public class UserProfile
{
    [BsonId, BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("userId"), BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = null!;

    [BsonElement("title")]
    public string Title { get; set; } = string.Empty; // Full Stack...

    [BsonElement("bio")]
    public string Bio { get; set; } = string.Empty;

    [BsonElement("location")]
    public string? Location { get; set; }

    [BsonElement("hourlyRate")]
    public decimal? HourlyRate { get; set; }

    [BsonElement("languages")]
    public List<string> Languages { get; set; } = new();

    [BsonElement("certifications")]
    public List<string> Certifications { get; set; } = new();

    [BsonElement("skills")]
    public List<string> SkillIds { get; set; } = new(); // ref Skill.Id

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
