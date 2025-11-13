using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;
using LanServe.Application.Interfaces.Repositories;

namespace LanServe.Infrastructure.Services
{
    public class GenericService<T> : IGenericService<T> where T : class
    {
        private readonly IGenericRepository<T> _repository;

        public GenericService(IGenericRepository<T> repository)
        {
            _repository = repository;
        }

        public async Task<T> CreateAsync(T entity)
        {
            await _repository.AddAsync(entity);
            return entity;
        }

        public Task<T?> GetByIdAsync(string id) => _repository.GetByIdAsync(id);

        public Task<IEnumerable<T>> GetAllAsync() => _repository.GetAllAsync();

        public Task UpdateAsync(string id, T entity) => _repository.UpdateAsync(id, entity);

        public Task DeleteAsync(string id) => _repository.DeleteAsync(id);
    }

}
