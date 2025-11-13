using LanServe.Application.Interfaces.Repositories;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;

namespace LanServe.Application.Services;

public class WalletService : IWalletService
{
    private readonly IWalletRepository _repo;
    private readonly IWalletTransactionRepository _walletTxns;

    public WalletService(IWalletRepository repo,
        IWalletTransactionRepository walletTxns)
    {
        _repo = repo;
        _walletTxns = walletTxns;
    }

    public Task<IEnumerable<Wallet>> GetAllAsync() => _repo.GetAllAsync();

    public Task<Wallet?> GetByIdAsync(string id) => _repo.GetByIdAsync(id);

    public Task<Wallet?> GetByUserIdAsync(string userId) => _repo.GetByUserIdAsync(userId);

    public async Task<Wallet> EnsureAsync(string userId)
    {
        var w = await _repo.GetByUserIdAsync(userId);
        if (w != null) return w;

        w = new Wallet
        {
            UserId = userId,
            Balance = 0,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };
        return await _repo.InsertAsync(w);
    }

    public async Task<long> GetBalanceAsync(string userId)
    {
        var w = await EnsureAsync(userId);
        return w.Balance;
    }

    public async Task<bool> UpdateAsync(string id, Wallet wallet)
    {
        wallet.Id = id;
        wallet.UpdatedAt = DateTime.UtcNow;
        return await _repo.UpdateAsync(wallet);
    }

    public Task<bool> DeleteAsync(string id) => _repo.DeleteAsync(id);

    public async Task<(bool Succeeded, string[] Errors, Wallet? Wallet)> ChangeBalanceAsync(
        string userId, long delta, string? note = null)
    {
        var w = await EnsureAsync(userId);

        // business rule: không cho âm
        if (delta < 0 && w.Balance + delta < 0)
            return (false, new[] { "Insufficient balance" }, w);

        w.Balance += delta;
        w.UpdatedAt = DateTime.UtcNow;

        var ok = await _repo.UpdateAsync(w);
        if (!ok) return (false, new[] { "Failed to update wallet" }, w);

        // Gợi ý: ghi log transaction ở đây nếu có WalletTransactionRepository.
        return (true, Array.Empty<string>(), w);
    }
    public async Task<IEnumerable<WalletTransaction>> GetTopupHistoryAsync(
        string userId, int take = 20, bool asc = false, CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(userId))
            throw new ArgumentException("userId required");

        var list = await _walletTxns.GetTopupsByUserAsync(userId, take, asc, ct);
        return list;
    }
    public async Task<(bool ok, string code, long balance)> TryWithdrawAsync(
        string userId, long amount, string? note = null, CancellationToken ct = default)
    {
        if (amount <= 0) return (false, "INVALID_AMOUNT", 0);

        var w = await _repo.GetOrCreateByUserAsync(userId, ct);

        // Không đủ tiền
        if (w.Balance < amount) return (false, "INSUFFICIENT_FUNDS", w.Balance);

        w.Balance -= amount;
        w.UpdatedAt = DateTime.UtcNow;

        var updated = await _repo.UpdateAsync(w, ct);
        if (!updated) return (false, "UPDATE_FAILED", w.Balance);

        // Ghi transaction
        await _walletTxns.InsertAsync(new WalletTransaction
        {
            WalletId = w.Id,
            UserId = userId,
            Type = "Withdraw",                // theo comment Type có TopUp/Withdraw/Hold/Release
            Amount = amount,
            BalanceAfter = w.Balance,
            Note = note ?? "Withdraw for project creation"
        }, ct);

        return (true, "OK", w.Balance);
    }
}
