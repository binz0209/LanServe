using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Services;

public interface IWalletService
{
    Task<IEnumerable<Wallet>> GetAllAsync();
    Task<Wallet?> GetByIdAsync(string id);
    Task<Wallet?> GetByUserIdAsync(string userId);

    /// <summary>Đảm bảo user có ví (nếu chưa có thì tạo 0đ).</summary>
    Task<Wallet> EnsureAsync(string userId);

    /// <summary>Lấy số dư ví theo userId (auto Ensure).</summary>
    Task<long> GetBalanceAsync(string userId);

    /// <summary>Update thông tin ví (Admin use-case).</summary>
    Task<bool> UpdateAsync(string id, Wallet wallet);

    Task<bool> DeleteAsync(string id);

    /// <summary>Điều chỉnh số dư: delta có thể + hoặc -; chặn âm nếu không cho overdraft.</summary>
    Task<(bool Succeeded, string[] Errors, Wallet? Wallet)> ChangeBalanceAsync(
        string userId, long delta, string? note = null);
    Task<IEnumerable<WalletTransaction>> GetTopupHistoryAsync(
        string userId, int take = 20, bool asc = false, CancellationToken ct = default);
    Task<(bool ok, string code, long balance)> TryWithdrawAsync(
        string userId, long amount, string? note = null, CancellationToken ct = default);
}
