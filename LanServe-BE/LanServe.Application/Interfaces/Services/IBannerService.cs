using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Services;

public interface IBannerService
{
    Task<IEnumerable<Banner>> GetAllBannersAsync();
    Task<IEnumerable<Banner>> GetActiveBannersAsync();
    Task<Banner?> GetBannerByIdAsync(string id);
    Task<Banner> CreateBannerAsync(Banner banner);
    Task<bool> UpdateBannerAsync(Banner banner);
    Task<bool> DeleteBannerAsync(string id);
}


