using LanServe.Application.Interfaces.Repositories;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;
using BCrypt.Net;

namespace LanServe.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _repo;
    private readonly IUserProfileService _profiles;

    public UserService(IUserRepository repo, IUserProfileService profiles)
    {
        _repo = repo;
        _profiles = profiles;
    }

    public Task<User?> GetByIdAsync(string id)
        => _repo.GetByIdAsync(id);

    public Task<User?> GetByEmailAsync(string email)
        => _repo.GetByEmailAsync(email);

    public async Task<User> RegisterAsync(string fullName, string email, string password, string role = "User")
    {
        var existing = await _repo.GetByEmailAsync(email);
        if (existing != null) throw new Exception("Email already exists");

        var user = new User
        {
            FullName = fullName,
            Email = email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = role,
            CreatedAt = DateTime.UtcNow
        };

        var createdUser = await _repo.InsertAsync(user);

        // ✅ Tạo UserProfile rỗng ngay sau khi đăng ký
        var emptyProfile = new UserProfile
        {
            UserId = createdUser.Id,
            Title = string.Empty,
            Bio = string.Empty,
            Location = string.Empty,
            HourlyRate = null,
            Languages = new List<string>(),
            Certifications = new List<string>(),
            SkillIds = new List<string>(),
            CreatedAt = DateTime.UtcNow
        };

        await _profiles.CreateAsync(emptyProfile);

        return createdUser;
    }

    public async Task<User?> ValidateUserAsync(string email, string password)
    {
        var user = await _repo.GetByEmailAsync(email);
        if (user == null) return null;

        return BCrypt.Net.BCrypt.Verify(password, user.PasswordHash) ? user : null;
    }

    public async Task<bool> UpdateAsync(string id, User user)
    {
        user.Id = id;
        return await _repo.UpdateAsync(user);
    }

    public Task<bool> DeleteAsync(string id)
        => _repo.DeleteAsync(id);

    public async Task<IEnumerable<User>> GetAllAsync()
    => await _repo.GetAllAsync();

    public async Task<(bool Succeeded, string[] Errors)> ChangePasswordAsync(string userId, string oldPassword, string newPassword)
    {
        var user = await _repo.GetByIdAsync(userId);
        if (user == null)
            return (false, new[] { "User not found" });

        var verify = BCrypt.Net.BCrypt.Verify(oldPassword, user.PasswordHash);
        if (!verify)
            return (false, new[] { "Old password is incorrect" });

        var newHash = BCrypt.Net.BCrypt.HashPassword(newPassword);

        var updated = await _repo.UpdatePasswordAsync(userId, newHash);

        return updated
            ? (true, Array.Empty<string>())
            : (false, new[] { "Failed to update password" });
    }

    public async Task UpdatePasswordAsync(string userId, string newPassword)
    {
        var user = await _repo.GetByIdAsync(userId);
        if (user == null) throw new Exception("User not found");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        await _repo.UpdateAsync(user);
    }
}
