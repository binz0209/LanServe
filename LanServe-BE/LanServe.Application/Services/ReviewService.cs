using LanServe.Application.Interfaces.Repositories;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;

namespace LanServe.Application.Services;

public class ReviewService : IReviewService
{
    private readonly IReviewRepository _repo;
    private readonly IUserProfileRepository _userProfileRepo;

    public ReviewService(IReviewRepository repo, IUserProfileRepository userProfileRepo)
    {
        _repo = repo;
        _userProfileRepo = userProfileRepo;
    }

    public Task<Review?> GetByIdAsync(string id)
        => _repo.GetByIdAsync(id);

    public Task<IEnumerable<Review>> GetByProjectIdAsync(string projectId)
        => _repo.GetByProjectIdAsync(projectId);

    public Task<IEnumerable<Review>> GetByUserAsync(string userId)
        => _repo.GetByUserAsync(userId);

    public async Task<Review> CreateAsync(Review entity)
    {
        // 0️⃣ Kiểm tra xem reviewer đã đánh giá project này chưa
        var existingReview = await _repo.GetByReviewerAndProjectAsync(entity.ReviewerId, entity.ProjectId);
        if (existingReview != null)
        {
            throw new InvalidOperationException("Bạn đã đánh giá project này rồi. Mỗi project chỉ có thể đánh giá 1 lần.");
        }

        entity.CreatedAt = DateTime.UtcNow;

        // 1️⃣ Lưu review mới
        var created = await _repo.InsertAsync(entity);

        // 2️⃣ Lấy tất cả review của người được đánh giá (Reviewee)
        var reviews = await _repo.GetByUserAsync(entity.RevieweeId);

        // 3️⃣ Tính điểm trung bình
        if (reviews != null && reviews.Any())
        {
            var avg = reviews.Average(r => r.Rating);

            // 4️⃣ Cập nhật rating trung bình vào UserProfile
            await _userProfileRepo.UpdateRatingAsync(entity.RevieweeId, avg);
        }

        return created;
    }

    public Task<bool> DeleteAsync(string id)
        => _repo.DeleteAsync(id);
}
