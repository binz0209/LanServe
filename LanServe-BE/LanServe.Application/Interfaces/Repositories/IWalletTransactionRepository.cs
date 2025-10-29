using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Repositories;

public interface IWalletTransactionRepository
{
    Task InsertAsync(WalletTransaction entity, CancellationToken ct = default);

    /// <summary>Lấy lịch sử giao dịch theo user (mọi loại), sort & take giới hạn.</summary>
    Task<IReadOnlyList<WalletTransaction>> GetHistoryByUserAsync(
        string userId, int take = 20, bool asc = false, CancellationToken ct = default);

    /// <summary>Lịch sử nạp tiền (Type == "TopUp") theo user.</summary>
    Task<IReadOnlyList<WalletTransaction>> GetTopupsByUserAsync(
        string userId, int take = 20, bool asc = false, CancellationToken ct = default);
}
