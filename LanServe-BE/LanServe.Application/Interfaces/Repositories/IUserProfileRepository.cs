using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Repositories;

public interface IUserProfileRepository
{
    Task<UserProfile?> GetByIdAsync(string id);
    Task<UserProfile?> GetByUserIdAsync(string userId);
    Task<UserProfile> InsertAsync(UserProfile entity);
    Task<bool> UpdateAsync(UserProfile entity);
    Task<bool> DeleteAsync(string id);
    Task<IEnumerable<UserProfile>> GetAllAsync();
}
