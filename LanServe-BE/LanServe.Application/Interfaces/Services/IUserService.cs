using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Services;

public interface IUserService
{
    Task<User?> GetByIdAsync(string id);
    Task<User?> GetByEmailAsync(string email);
    Task<User> RegisterAsync(string fullName, string email, string password, string role = "User");
    Task<User?> ValidateUserAsync(string email, string password);
    Task<bool> UpdateAsync(string id, User user);
    Task<bool> DeleteAsync(string id);
    Task<IEnumerable<User>> GetAllAsync();
    Task<(bool Succeeded, string[] Errors)> ChangePasswordAsync(string userId, string oldPassword, string newPassword);
    Task UpdatePasswordAsync(string userId, string newPassword);
}
