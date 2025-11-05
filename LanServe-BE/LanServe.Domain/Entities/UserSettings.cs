// LanServe.Domain/Entities/UserSettings.cs
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LanServe.Domain.Entities;

public class UserSettings
{
    [BsonId, BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("userId"), BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = null!;

    [BsonElement("notificationSettings")]
    public NotificationSettings NotificationSettings { get; set; } = new();

    [BsonElement("privacySettings")]
    public PrivacySettings PrivacySettings { get; set; } = new();

    [BsonElement("updatedAt")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public class NotificationSettings
{
    [BsonElement("emailNotifications")]
    public bool EmailNotifications { get; set; } = true;

    [BsonElement("messageNotifications")]
    public bool MessageNotifications { get; set; } = true;

    [BsonElement("newProjectNotifications")]
    public bool NewProjectNotifications { get; set; } = true;
}

public class PrivacySettings
{
    [BsonElement("publicProfile")]
    public bool PublicProfile { get; set; } = true;

    [BsonElement("showOnlineStatus")]
    public bool ShowOnlineStatus { get; set; } = false;
}
