using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Services;

public interface IUserProfileService
{
    Task<UserProfile?> GetByIdAsync(string id);
    Task<UserProfile?> GetByUserIdAsync(string userId);
    Task<UserProfile> CreateAsync(UserProfile entity);
    Task<bool> UpdateAsync(string id, UserProfile entity);
    Task<bool> DeleteAsync(string id);
    Task<IEnumerable<UserProfile>> GetAllAsync();
}
