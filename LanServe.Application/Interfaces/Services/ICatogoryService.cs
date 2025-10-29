using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Services;

public interface ICategoryService
{
    Task<IEnumerable<Category>> GetAllAsync();
    Task<Category?> GetByIdAsync(string id);
    Task<Category> CreateAsync(Category entity);
    Task<bool> UpdateAsync(string id, Category entity);
    Task<bool> DeleteAsync(string id);
}
