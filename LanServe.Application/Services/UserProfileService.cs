using LanServe.Application.Interfaces.Repositories;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;

namespace LanServe.Application.Services;

public class UserProfileService : IUserProfileService
{
    private readonly IUserProfileRepository _repo;

    public UserProfileService(IUserProfileRepository repo)
    {
        _repo = repo;
    }

    public Task<UserProfile?> GetByIdAsync(string id)
        => _repo.GetByIdAsync(id);

    public Task<UserProfile?> GetByUserIdAsync(string userId)
        => _repo.GetByUserIdAsync(userId);

    public Task<UserProfile> CreateAsync(UserProfile entity)
    {
        entity.CreatedAt = DateTime.UtcNow;
        return _repo.InsertAsync(entity);
    }

    public async Task<bool> UpdateAsync(string id, UserProfile entity)
    {
        entity.Id = id;
        return await _repo.UpdateAsync(entity);
    }

    public Task<bool> DeleteAsync(string id)
        => _repo.DeleteAsync(id);

    public async Task<IEnumerable<UserProfile>> GetAllAsync() { 
        return await _repo.GetAllAsync();

    }
}
