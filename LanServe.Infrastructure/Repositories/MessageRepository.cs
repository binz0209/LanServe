using LanServe.Application.Interfaces.Repositories;
using LanServe.Domain.Entities;
using MongoDB.Bson;
using MongoDB.Driver;

namespace LanServe.Infrastructure.Repositories;

public class MessageRepository : IMessageRepository
{
    private readonly IMongoCollection<Message> _col;

    public MessageRepository(IMongoCollection<Message> collection)
    {
        _col = collection;
    }

    public async Task<Message> AddAsync(Message message)
    {
        await _col.InsertOneAsync(message);
        return message;
    }

    public async Task<bool> MarkAsReadAsync(string id)
    {
        var res = await _col.UpdateOneAsync(
            Builders<Message>.Filter.Eq(x => x.Id, id),
            Builders<Message>.Update.Set(x => x.IsRead, true)
        );
        return res.ModifiedCount > 0;
    }

    public async Task<List<Message>> GetByConversationAsync(string conversationKey)
    {
        var cur = await _col.Find(x => x.ConversationKey == conversationKey)
                            .SortBy(x => x.CreatedAt)
                            .ToListAsync();
        return cur;
    }

    public async Task<List<Message>> GetByProjectAsync(string projectId)
    {
        var cur = await _col.Find(x => x.ProjectId == projectId)
                            .SortBy(x => x.CreatedAt)
                            .ToListAsync();
        return cur;
    }

    public async Task<List<Message>> GetByUserAsync(string userId)
    {
        var filter = Builders<Message>.Filter.Or(
            Builders<Message>.Filter.Eq(x => x.SenderId, userId),
            Builders<Message>.Filter.Eq(x => x.ReceiverId, userId)
        );
        var cur = await _col.Find(filter)
                            .SortBy(x => x.CreatedAt)
                            .ToListAsync();
        return cur;
    }

    public async Task<List<(string ConversationKey, string PartnerId, string LastMessage, DateTime LastAt, int UnreadCount)>>
GetConversationsForUserAsync(string userId)
    {
        // match: user là người gửi hoặc nhận
        var match = Builders<Message>.Filter.Or(
            Builders<Message>.Filter.Eq(x => x.SenderId, userId),
            Builders<Message>.Filter.Eq(x => x.ReceiverId, userId)
        );

        // ⚠️ Dùng đúng tên field theo [BsonElement] (camelCase)
        var pipeline = _col.Aggregate()
            .Match(match)
            .SortBy(m => m.CreatedAt) // để $last lấy tin nhắn mới nhất
            .Group(new BsonDocument
            {
            { "_id", "$conversationKey" },
            { "lastMessage", new BsonDocument("$last", "$text") },
            { "lastAt", new BsonDocument("$last", "$createdAt") },
            { "unreadCount", new BsonDocument("$sum", new BsonDocument("$cond", new BsonArray{
                // chỉ tính unread khi người nhận là user hiện tại và isRead=false
                new BsonDocument("$and", new BsonArray{
                    new BsonDocument("$eq", new BsonArray{"$receiverId", userId}),
                    new BsonDocument("$eq", new BsonArray{"$isRead", false})
                }),
                1, 0
            })) }
            })
            // split key -> luôn lấy 2 phần cuối là userIds (an toàn cho cả "min:max" và "project:min:max")
            .Project(new BsonDocument
            {
            { "conversationKey", "$_id" },
            { "lastMessage", "$lastMessage" },
            { "lastAt", "$lastAt" },
            { "unreadCount", "$unreadCount" },
            { "parts", new BsonDocument("$cond", new BsonArray{
                new BsonDocument("$and", new BsonArray{
                    new BsonDocument("$ne", new BsonArray{"$_id", BsonNull.Value}),
                    new BsonDocument("$ne", new BsonArray{"$_id", ""})
                }),
                new BsonDocument("$split", new BsonArray{"$_id", ":"}),
                new BsonArray{} // fallback
            }) },
            { "_id", 0 }
            })
            // MongoDB cho phép index âm với $arrayElemAt để lấy từ cuối mảng
            .Project(new BsonDocument
            {
            { "conversationKey", "$conversationKey" },
            { "lastMessage", "$lastMessage" },
            { "lastAt", "$lastAt" },
            { "unreadCount", "$unreadCount" },
            { "u1", new BsonDocument("$arrayElemAt", new BsonArray{"$parts", -1}) }, // phần cuối
            { "u2", new BsonDocument("$arrayElemAt", new BsonArray{"$parts", -2}) }  // phần kế cuối
            })
            // partnerId = (u1 == userId) ? u2 : u1
            .Project(new BsonDocument
            {
            { "conversationKey", "$conversationKey" },
            { "lastMessage", "$lastMessage" },
            { "lastAt", "$lastAt" },
            { "unreadCount", "$unreadCount" },
            { "partnerId", new BsonDocument("$cond", new BsonArray{
                new BsonDocument("$eq", new BsonArray{"$u1", userId}),
                "$u2",
                "$u1"
            })}
            })
            .Sort(new BsonDocument("lastAt", -1));

        var docs = await pipeline.ToListAsync();

        return docs.Select(d => (
            ConversationKey: d.GetValue("conversationKey", "").ToString(),
            PartnerId: d.GetValue("partnerId", "").ToString(),
            LastMessage: d.GetValue("lastMessage", "").IsBsonNull ? "" : d["lastMessage"].ToString(),
            LastAt: d.GetValue("lastAt", BsonNull.Value).IsBsonNull
                ? DateTime.MinValue
                : d["lastAt"].ToUniversalTime(),
            UnreadCount: d.GetValue("unreadCount", 0).ToInt32()
        )).ToList();
    }
    public async Task<long> DeleteByProposalIdInHtmlAsync(string proposalId)
    {
        // Xoá theo substring an toàn, không cần regex phức tạp
        var pattern = $"data-proposal-id='{proposalId}'";
        var filter = Builders<Message>.Filter.Regex(m => m.Text, new MongoDB.Bson.BsonRegularExpression(pattern));
        var res = await _col.DeleteManyAsync(filter);
        return res.DeletedCount;
    }

}
