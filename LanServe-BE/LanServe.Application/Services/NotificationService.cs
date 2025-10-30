using LanServe.Application.Interfaces.Repositories;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;

namespace LanServe.Application.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _repo;
    private readonly IRealtimeService _realtime;
    public NotificationService(INotificationRepository repo, IRealtimeService realtime)
    {
        _repo = repo;
        _realtime = realtime;
    }

    public Task<IEnumerable<Notification>> GetByUserAsync(string userId)
        => _repo.GetByUserAsync(userId);

    public Task<Notification?> GetByIdAsync(string id)
        => _repo.GetByIdAsync(id);

    public async Task<Notification> CreateAsync(Notification entity)
    {
        entity.CreatedAt = DateTime.UtcNow;
        entity.IsRead = false;
        var saved = await _repo.InsertAsync(entity);
        await _realtime.SendToUserAsync(saved.UserId, saved);
        return saved;
    }

    public Task<bool> MarkAsReadAsync(string id)
        => _repo.MarkAsReadAsync(id);

    public Task<bool> DeleteAsync(string id)
        => _repo.DeleteAsync(id);
}
