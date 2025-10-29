// GenericRepository.cs
using MongoDB.Driver;
using System.Linq.Expressions;
using LanServe.Application.Interfaces.Repositories;

namespace LanServe.Infrastructure.Repositories;

public class GenericRepository<T> : IGenericRepository<T>
{
    protected readonly IMongoCollection<T> _collection;

    public GenericRepository(IMongoCollection<T> collection)
    {
        _collection = collection;
    }

    public async Task<IEnumerable<T>> GetAllAsync()
        => await _collection.Find(_ => true).ToListAsync();

    public async Task<T?> GetByIdAsync(string id)
        => await _collection.Find(Builders<T>.Filter.Eq("_id", id)).FirstOrDefaultAsync();

    public async Task AddAsync(T entity)
        => await _collection.InsertOneAsync(entity);

    public async Task UpdateAsync(string id, T entity)
        => await _collection.ReplaceOneAsync(Builders<T>.Filter.Eq("_id", id), entity);

    public async Task DeleteAsync(string id)
        => await _collection.DeleteOneAsync(Builders<T>.Filter.Eq("_id", id));

    public async Task<IEnumerable<T>> FindAsync(Expression<Func<T, bool>> predicate)
        => await _collection.Find(predicate).ToListAsync();
}
