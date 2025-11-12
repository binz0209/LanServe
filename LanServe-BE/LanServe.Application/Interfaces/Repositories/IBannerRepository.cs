using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Repositories;

public interface IBannerRepository
{
    Task<IEnumerable<Banner>> GetAllAsync();
    Task<IEnumerable<Banner>> GetActiveBannersAsync();
    Task<Banner?> GetByIdAsync(string id);
    Task<Banner> InsertAsync(Banner entity);
    Task<bool> UpdateAsync(Banner entity);
    Task<bool> DeleteAsync(string id);
}


