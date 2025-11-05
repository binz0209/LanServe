using LanServe.Application.Interfaces.Repositories;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;

namespace LanServe.Application.Services;

public class UserSettingsService : IUserSettingsService
{
    private readonly IUserSettingsRepository _repo;

    public UserSettingsService(IUserSettingsRepository repo)
    {
        _repo = repo;
    }

    public Task<IEnumerable<UserSettings>> GetAllAsync() => _repo.GetAllAsync();

    public Task<UserSettings?> GetByIdAsync(string id) => _repo.GetByIdAsync(id);

    public Task<UserSettings?> GetByUserIdAsync(string userId) => _repo.GetByUserIdAsync(userId);

    public async Task<UserSettings> EnsureAsync(string userId)
    {
        var settings = await _repo.GetByUserIdAsync(userId);
        if (settings != null) return settings;

        settings = new UserSettings
        {
            UserId = userId,
            NotificationSettings = new NotificationSettings(),
            PrivacySettings = new PrivacySettings(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        return await _repo.InsertAsync(settings);
    }

    public async Task<bool> UpdateAsync(string id, UserSettings settings)
    {
        settings.Id = id;
        settings.UpdatedAt = DateTime.UtcNow;
        return await _repo.UpdateAsync(settings);
    }

    public Task<bool> DeleteAsync(string id) => _repo.DeleteAsync(id);

    public async Task<UserSettings> UpdateNotificationSettingsAsync(string userId, NotificationSettings notificationSettings)
    {
        var settings = await EnsureAsync(userId);
        settings.NotificationSettings = notificationSettings;
        settings.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(settings);
        return settings;
    }

    public async Task<UserSettings> UpdatePrivacySettingsAsync(string userId, PrivacySettings privacySettings)
    {
        var settings = await EnsureAsync(userId);
        settings.PrivacySettings = privacySettings;
        settings.UpdatedAt = DateTime.UtcNow;
        await _repo.UpdateAsync(settings);
        return settings;
    }
}

