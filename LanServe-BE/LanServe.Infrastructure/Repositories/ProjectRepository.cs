using LanServe.Application.Interfaces.Repositories;
using LanServe.Domain.Entities;
using MongoDB.Driver;

namespace LanServe.Infrastructure.Repositories;

public class ProjectRepository : IProjectRepository
{
    private readonly IMongoCollection<Project> _collection;

    public ProjectRepository(IMongoCollection<Project> collection)
    {
        _collection = collection;
    }

    public async Task<Project?> GetByIdAsync(string id)
        => await _collection.Find(x => x.Id == id).FirstOrDefaultAsync();

    public async Task<IEnumerable<Project>> GetByOwnerIdAsync(string ownerId)
        => await _collection.Find(x => x.OwnerId == ownerId)
                            .SortByDescending(x => x.CreatedAt)
                            .ToListAsync();

    public async Task<IEnumerable<Project>> GetOpenProjectsAsync()
        => await _collection.Find(x => x.Status == "Open")
                            .SortByDescending(x => x.CreatedAt)
                            .ToListAsync();

    public async Task<Project> InsertAsync(Project entity)
    {
        await _collection.InsertOneAsync(entity);
        return entity;
    }

    public async Task<bool> UpdateAsync(Project entity)
    {
        var result = await _collection.ReplaceOneAsync(x => x.Id == entity.Id, entity);
        return result.ModifiedCount > 0;
    }

    public async Task<bool> DeleteAsync(string id)
    {
        var result = await _collection.DeleteOneAsync(x => x.Id == id);
        return result.DeletedCount > 0;
    }

    public async Task<IEnumerable<Project>> GetByStatusAsync(string status)
    {
        return await _collection.Find(x => x.Status == status).ToListAsync();
    }
    public async Task<IEnumerable<Project>> GetAllAsync()
    {
        return await _collection.Find(_ => true).ToListAsync();
    }
    public async Task<Project?> UpdateStatusAsync(string id, string newStatus)
    {
        var update = Builders<Project>.Update.Set(p => p.Status, newStatus);
        var result = await _collection.FindOneAndUpdateAsync(
            p => p.Id == id,
            update,
            new FindOneAndUpdateOptions<Project> { ReturnDocument = ReturnDocument.After }
        );
        return result;
    }
}
