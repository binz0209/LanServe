using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Services;

public interface IUserSettingsService
{
    Task<IEnumerable<UserSettings>> GetAllAsync();
    Task<UserSettings?> GetByIdAsync(string id);
    Task<UserSettings?> GetByUserIdAsync(string userId);

    /// <summary>Đảm bảo user có settings (nếu chưa có thì tạo với default values).</summary>
    Task<UserSettings> EnsureAsync(string userId);

    /// <summary>Update settings theo userId.</summary>
    Task<bool> UpdateAsync(string id, UserSettings settings);

    Task<bool> DeleteAsync(string id);
    
    /// <summary>Update notification settings theo userId.</summary>
    Task<UserSettings> UpdateNotificationSettingsAsync(string userId, NotificationSettings notificationSettings);
    
    /// <summary>Update privacy settings theo userId.</summary>
    Task<UserSettings> UpdatePrivacySettingsAsync(string userId, PrivacySettings privacySettings);
}

