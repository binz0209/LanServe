using LanServe.Application.Interfaces.Repositories;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;

namespace LanServe.Application.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _repo;

    public ReviewService(IReviewRepository repo)
    {
        _repo = repo;
    }

    public Task<Review?> GetByIdAsync(string id)
        => _repo.GetByIdAsync(id);

    public Task<IEnumerable<Review>> GetByProjectIdAsync(string projectId)
        => _repo.GetByProjectIdAsync(projectId);

    public Task<IEnumerable<Review>> GetByUserAsync(string userId)
        => _repo.GetByUserAsync(userId);

    public Task<Review> CreateAsync(Review entity)
    {
        entity.CreatedAt = DateTime.UtcNow;
        return _repo.InsertAsync(entity);
    }

    public Task<bool> DeleteAsync(string id)
        => _repo.DeleteAsync(id);
}
