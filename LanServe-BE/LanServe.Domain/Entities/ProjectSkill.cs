// LanServe.Domain/Entities/ProjectSkill.cs
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LanServe.Domain.Entities;

public class ProjectSkill
{
    [BsonId, BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("projectId"), BsonRepresentation(BsonType.ObjectId)]
    public string ProjectId { get; set; } = null!;

    [BsonElement("skillId"), BsonRepresentation(BsonType.ObjectId)]
    public string SkillId { get; set; } = null!;
}
