using LanServe.Application.Interfaces.Repositories;
using LanServe.Domain.Entities;
using MongoDB.Driver;

namespace LanServe.Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository
{
    private readonly IMongoCollection<Notification> _collection;

    public NotificationRepository(IMongoCollection<Notification> collection)
    {
        _collection = collection;
    }

    public async Task<IEnumerable<Notification>> GetByUserAsync(string userId)
        => await _collection.Find(x => x.UserId == userId)
                            .SortByDescending(x => x.CreatedAt)
                            .ToListAsync();

    public async Task<Notification?> GetByIdAsync(string id)
        => await _collection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task<Notification> InsertAsync(Notification entity)
    {
        await _collection.InsertOneAsync(entity);
        return entity;
    }

    public async Task<bool> MarkAsReadAsync(string id)
    {
        var update = Builders<Notification>.Update.Set(x => x.IsRead, true);
        var result = await _collection.UpdateOneAsync(x => x.Id == id, update);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _collection.DeleteOneAsync(x => x.Id == id);
        return result.DeletedCount > 0;
    }
}
