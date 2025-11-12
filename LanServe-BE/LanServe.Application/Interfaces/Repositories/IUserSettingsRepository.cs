using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Repositories;

public interface IUserSettingsRepository
{
    Task<IEnumerable<UserSettings>> GetAllAsync();
    Task<UserSettings?> GetByIdAsync(string id);
    Task<UserSettings?> GetByUserIdAsync(string userId);

    Task<UserSettings> InsertAsync(UserSettings entity);
    Task<bool> UpdateAsync(UserSettings entity, CancellationToken ct = default);
    Task<bool> DeleteAsync(string id);
    Task<UserSettings> GetOrCreateByUserAsync(string userId, CancellationToken ct = default);
}

