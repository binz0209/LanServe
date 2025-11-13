using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Repositories;

public interface INotificationRepository
{
    Task<IEnumerable<Notification>> GetByUserAsync(string userId);
    Task<Notification?> GetByIdAsync(string id);
    Task<Notification> InsertAsync(Notification entity);
    Task<bool> MarkAsReadAsync(string id);
    Task<bool> DeleteAsync(string id);
}
