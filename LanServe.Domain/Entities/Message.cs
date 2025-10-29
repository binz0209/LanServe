// LanServe.Domain/Entities/Message.cs
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LanServe.Domain.Entities;

public class Message
{
    [BsonId, BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("conversationKey")]
    public string ConversationKey { get; set; } = string.Empty;
    // gợi ý: $"{Min(senderId,receiverId)}:{Max(senderId,receiverId)}" hoặc projectId:userId

    [BsonElement("projectId"), BsonRepresentation(BsonType.ObjectId)]
    public string? ProjectId { get; set; }

    [BsonElement("senderId"), BsonRepresentation(BsonType.ObjectId)]
    public string SenderId { get; set; } = null!;

    [BsonElement("receiverId"), BsonRepresentation(BsonType.ObjectId)]
    public string ReceiverId { get; set; } = null!;

    [BsonElement("text")]
    public string Text { get; set; } = string.Empty;

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("isRead")]
    public bool IsRead { get; set; }
}
