// LanServe.Application/Services/PaymentService.cs
using LanServe.Application.Interfaces.Repositories;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;

namespace LanServe.Application.Services;

public class PaymentService : IPaymentService
{
    private readonly IVnPayService _vnPay;
    private readonly IPaymentRepository _payments;
    private readonly IWalletRepository _wallets;
    private readonly IWalletTransactionRepository _walletTxns;

    public PaymentService(
        IVnPayService vnPay,
        IPaymentRepository payments,
        IWalletRepository wallets,
        IWalletTransactionRepository walletTxns)
    {
        _vnPay = vnPay;
        _payments = payments;
        _wallets = wallets;
        _walletTxns = walletTxns;
    }

    public async Task<string> CreateTopUpAsync(string userId, decimal amount, string ip, CancellationToken ct = default)
    {
        var wallet = await _wallets.GetOrCreateByUserAsync(userId, ct);
        var shortUser = userId.Length >= 6 ? userId[..6] : userId;
        var txnRef = $"LS{DateTime.UtcNow:yyyyMMddHHmmssfff}-{shortUser}";

        var payment = new Payment
        {
            UserId = userId,
            WalletId = wallet.Id,
            Purpose = "TopUp",
            Amount = amount,
            Currency = "VND",
            Status = "Pending",
            Vnp_TxnRef = txnRef
        };
        await _payments.InsertAsync(payment, ct);

        // VNPAY nhận integer VND -> round
        var amountVnd = (long)Math.Round(amount, MidpointRounding.AwayFromZero);
        var url = _vnPay.CreatePaymentUrl(txnRef, amountVnd, ip, $"Topup wallet {wallet.Id}");
        return url;
    }

    public async Task<(bool ok, string redirect)> HandleVnPayReturnAsync(
        IDictionary<string, string> queryParams,
        CancellationToken ct = default)
    {
        if (!_vnPay.ValidateSecureHash(queryParams))
            return (false, "/payment-failed?reason=invalid-signature");

        if (!queryParams.TryGetValue("vnp_TxnRef", out var txnRef) || string.IsNullOrWhiteSpace(txnRef))
            return (false, "/payment-failed?reason=missing-txnref");

        var pay = await _payments.GetByTxnRefAsync(txnRef, ct);
        if (pay is null) return (false, "/payment-failed?reason=not-found");

        queryParams.TryGetValue("vnp_ResponseCode", out var resp);
        queryParams.TryGetValue("vnp_TransactionNo", out var transNo);
        queryParams.TryGetValue("vnp_BankCode", out var bankCode);
        queryParams.TryGetValue("vnp_CardType", out var cardType);
        queryParams.TryGetValue("vnp_PayDate", out var payDate);
        queryParams.TryGetValue("vnp_SecureHash", out var secureHash);

        pay.Vnp_ResponseCode = resp;
        pay.Vnp_TransactionNo = transNo;
        pay.Vnp_BankCode = bankCode;
        pay.Vnp_CardType = cardType;
        pay.Vnp_PayDate = payDate;
        pay.Vnp_SecureHash = secureHash;
        pay.Vnp_RawQuery = string.Join("&", queryParams.Select(x => $"{x.Key}={x.Value}"));

        if (resp == "00")
        {
            pay.Status = "Paid";
            pay.PaidAt = DateTime.UtcNow;

            var wallet = await _wallets.GetOrCreateByUserAsync(pay.UserId, ct);
            wallet.Balance += (long)Math.Round(pay.Amount, MidpointRounding.AwayFromZero);
            wallet.UpdatedAt = DateTime.UtcNow;
            await _wallets.UpdateAsync(wallet, ct);

            await _walletTxns.InsertAsync(new WalletTransaction
            {
                WalletId = wallet.Id,
                UserId = pay.UserId,
                PaymentId = pay.Id,
                Type = "TopUp",
                Amount = (long)Math.Round(pay.Amount, MidpointRounding.AwayFromZero),
                BalanceAfter = wallet.Balance,
                Note = $"TopUp via VNPAY {pay.Vnp_TransactionNo}"
            }, ct);
        }
        else
        {
            pay.Status = "Failed";
        }

        await _payments.UpdateAsync(pay, ct);

        var redirect = pay.Status == "Paid"
            ? $"/payment-success?orderId={pay.Vnp_TxnRef}"
            : $"/payment-failed?orderId={pay.Vnp_TxnRef}&code={pay.Vnp_ResponseCode}";
        return (true, redirect);
    }
}
