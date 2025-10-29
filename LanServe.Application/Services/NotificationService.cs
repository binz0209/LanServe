using LanServe.Application.Interfaces.Repositories;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;

namespace LanServe.Application.Services;

public class NotificationService : INotificationService
{
    private readonly INotificationRepository _repo;

    public NotificationService(INotificationRepository repo)
    {
        _repo = repo;
    }

    public Task<IEnumerable<Notification>> GetByUserAsync(string userId)
        => _repo.GetByUserAsync(userId);

    public Task<Notification?> GetByIdAsync(string id)
        => _repo.GetByIdAsync(id);

    public Task<Notification> CreateAsync(Notification entity)
    {
        entity.CreatedAt = DateTime.UtcNow;
        entity.IsRead = false;
        return _repo.InsertAsync(entity);
    }

    public Task<bool> MarkAsReadAsync(string id)
        => _repo.MarkAsReadAsync(id);

    public Task<bool> DeleteAsync(string id)
        => _repo.DeleteAsync(id);
}
