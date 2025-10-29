using LanServe.Application.Interfaces.Repositories;
using LanServe.Domain.Entities;
using MongoDB.Driver;

namespace LanServe.Infrastructure.Repositories;

public class ReviewRepository : IReviewRepository
{
    private readonly IMongoCollection<Review> _collection;

    public ReviewRepository(IMongoCollection<Review> collection)
    {
        _collection = collection;
    }

    public async Task<Review?> GetByIdAsync(string id)
        => await _collection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task<IEnumerable<Review>> GetByProjectIdAsync(string projectId)
        => await _collection.Find(x => x.ProjectId == projectId)
                            .SortByDescending(x => x.CreatedAt)
                            .ToListAsync();

    public async Task<IEnumerable<Review>> GetByUserAsync(string userId)
      => await _collection.Find(x => x.RevieweeId == userId)
                          .SortByDescending(x => x.CreatedAt)
                          .ToListAsync();

    public async Task<Review> InsertAsync(Review entity)
    {
        await _collection.InsertOneAsync(entity);
        return entity;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _collection.DeleteOneAsync(x => x.Id == id);
        return result.DeletedCount > 0;
    }
}
