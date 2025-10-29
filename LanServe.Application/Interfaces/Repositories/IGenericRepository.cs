// IGenericRepository.cs
using System.Linq.Expressions;

namespace LanServe.Application.Interfaces.Repositories;

public interface IGenericRepository<T>
{
    Task<IEnumerable<T>> GetAllAsync();
    Task<T?> GetByIdAsync(string id);
    Task AddAsync(T entity);
    Task UpdateAsync(string id, T entity);
    Task DeleteAsync(string id);

    Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate);
}
