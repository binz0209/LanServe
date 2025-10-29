using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Services
{
    public interface IGenericService<T> where T : class
    {
        Task<T> CreateAsync(T entity);
        Task<T?> GetByIdAsync(string id);
        Task<IEnumerable<T>> GetAllAsync();
        Task UpdateAsync(string id, T entity);
        Task DeleteAsync(string id);
    }
}
