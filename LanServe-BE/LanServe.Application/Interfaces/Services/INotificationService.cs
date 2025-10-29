using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Services;

public interface INotificationService
{
    Task<IEnumerable<Notification>> GetByUserAsync(string userId);
    Task<Notification?> GetByIdAsync(string id);
    Task<Notification> CreateAsync(Notification entity);
    Task<bool> MarkAsReadAsync(string id);
    Task<bool> DeleteAsync(string id);
}
