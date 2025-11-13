using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Repositories;

public interface ICategoryRepository
{
    Task<IEnumerable<Category>> GetAllAsync();
    Task<Category?> GetByIdAsync(string id);
    Task<Category> InsertAsync(Category entity);
    Task<bool> UpdateAsync(Category entity);
    Task<bool> DeleteAsync(string id);
}
