using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Repositories;

public interface IWalletRepository
{
    Task<IEnumerable<Wallet>> GetAllAsync();
    Task<Wallet?> GetByIdAsync(string id);
    Task<Wallet?> GetByUserIdAsync(string userId);

    Task<Wallet> InsertAsync(Wallet entity);
    Task<bool> UpdateAsync(Wallet entity, CancellationToken ct = default);
    Task<bool> DeleteAsync(string id);
    Task<Wallet> GetOrCreateByUserAsync(string userId, CancellationToken ct = default);
}
