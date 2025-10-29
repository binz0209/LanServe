using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Repositories;

public interface IUserRepository
{
    Task<User?> GetByIdAsync(string id);
    Task<User?> GetByEmailAsync(string email);
    Task<User> InsertAsync(User entity);
    Task<bool> UpdateAsync(User entity);
    Task<bool> DeleteAsync(string id);
    Task<IEnumerable<User>> GetAllAsync();
    Task<bool> UpdatePasswordAsync(string id, string hashedPassword);
}
