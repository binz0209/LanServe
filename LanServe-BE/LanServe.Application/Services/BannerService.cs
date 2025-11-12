using LanServe.Application.Interfaces.Repositories;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;

namespace LanServe.Application.Services;

public class BannerService : IBannerService
{
    private readonly IBannerRepository _bannerRepository;

    public BannerService(IBannerRepository bannerRepository)
    {
        _bannerRepository = bannerRepository;
    }

    public async Task<IEnumerable<Banner>> GetAllBannersAsync()
        => await _bannerRepository.GetAllAsync();

    public async Task<IEnumerable<Banner>> GetActiveBannersAsync()
        => await _bannerRepository.GetActiveBannersAsync();

    public async Task<Banner?> GetBannerByIdAsync(string id)
        => await _bannerRepository.GetByIdAsync(id);

    public async Task<Banner> CreateBannerAsync(Banner banner)
    {
        banner.CreatedAt = DateTime.UtcNow;
        banner.UpdatedAt = DateTime.UtcNow;
        return await _bannerRepository.InsertAsync(banner);
    }

    public async Task<bool> UpdateBannerAsync(Banner banner)
    {
        banner.UpdatedAt = DateTime.UtcNow;
        return await _bannerRepository.UpdateAsync(banner);
    }

    public async Task<bool> DeleteBannerAsync(string id)
        => await _bannerRepository.DeleteAsync(id);
}


