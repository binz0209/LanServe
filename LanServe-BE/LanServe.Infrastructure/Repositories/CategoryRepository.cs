using LanServe.Application.Interfaces.Repositories;
using LanServe.Domain.Entities;
using MongoDB.Driver;

namespace LanServe.Infrastructure.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly IMongoCollection<Category> _collection;

    public CategoryRepository(IMongoCollection<Category> collection)
    {
        _collection = collection;
    }

    public async Task<IEnumerable<Category>> GetAllAsync()
        => await _collection.Find(_ => true).ToListAsync();

    public async Task<Category?> GetByIdAsync(string id)
        => await _collection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task<Category> InsertAsync(Category entity)
    {
        await _collection.InsertOneAsync(entity);
        return entity;
    }

    public async Task<bool> UpdateAsync(Category entity)
    {
        var result = await _collection.ReplaceOneAsync(x => x.Id == entity.Id, entity);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _collection.DeleteOneAsync(x => x.Id == id);
        return result.DeletedCount > 0;
    }
}
