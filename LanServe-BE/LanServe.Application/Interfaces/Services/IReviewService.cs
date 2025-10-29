using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Services;

public interface IReviewService
{
    Task<Review?> GetByIdAsync(string id);
    Task<IEnumerable<Review>> GetByProjectIdAsync(string projectId);
    Task<IEnumerable<Review>> GetByUserAsync(string userId);
    Task<Review> CreateAsync(Review entity);
    Task<bool> DeleteAsync(string id);
}
