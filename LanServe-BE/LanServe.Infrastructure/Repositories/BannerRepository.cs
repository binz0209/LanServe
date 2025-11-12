using LanServe.Application.Interfaces.Repositories;
using LanServe.Domain.Entities;
using MongoDB.Driver;

namespace LanServe.Infrastructure.Repositories;

public class BannerRepository : IBannerRepository
{
    private readonly IMongoCollection<Banner> _collection;

    public BannerRepository(IMongoCollection<Banner> collection)
    {
        _collection = collection;
    }

    public async Task<IEnumerable<Banner>> GetAllAsync()
        => await _collection.Find(_ => true).SortBy(x => x.Order).ToListAsync();

    public async Task<IEnumerable<Banner>> GetActiveBannersAsync()
        => await _collection.Find(x => x.IsActive).SortBy(x => x.Order).ToListAsync();

    public async Task<Banner?> GetByIdAsync(string id)
        => await _collection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task<Banner> InsertAsync(Banner entity)
    {
        await _collection.InsertOneAsync(entity);
        return entity;
    }

    public async Task<bool> UpdateAsync(Banner entity)
    {
        entity.UpdatedAt = DateTime.UtcNow;
        var result = await _collection.ReplaceOneAsync(x => x.Id == entity.Id, entity);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _collection.DeleteOneAsync(x => x.Id == id);
        return result.DeletedCount > 0;
    }
}


