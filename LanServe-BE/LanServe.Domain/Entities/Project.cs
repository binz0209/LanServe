// LanServe.Domain/Entities/Project.cs
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LanServe.Domain.Entities;

public class Project
{
    [BsonId, BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }

    [BsonElement("ownerId"), BsonRepresentation(BsonType.ObjectId)]
    public string OwnerId { get; set; } = null!;   // User.Id

    [BsonElement("title")]
    public string Title { get; set; } = string.Empty;

    [BsonElement("description")]
    public string Description { get; set; } = string.Empty;

    [BsonElement("categoryId"), BsonRepresentation(BsonType.ObjectId)]
    public string? CategoryId { get; set; }

    [BsonElement("skillIds")]
    public List<string> SkillIds { get; set; } = new(); // ref Skill.Id

    [BsonElement("budgetType")]
    public string BudgetType { get; set; } = "Fixed"; // Fixed/Hourly

    [BsonElement("budgetAmount")]
    public decimal? BudgetAmount { get; set; }

    [BsonElement("deadline")]
    public DateTime? Deadline { get; set; }

    [BsonElement("status")]
    public string Status { get; set; } = "Open"; // Open/InProgress/Completed/Cancelled

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
