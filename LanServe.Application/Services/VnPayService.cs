// LanServe.Application/Services/VnPayService.cs
using System.Security.Cryptography;
using System.Text;
using LanServe.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;

namespace LanServe.Application.Services;

public class VnPayService : IVnPayService
{
    private readonly string _tmnCode;
    private readonly string _hashSecret;
    private readonly string _paymentUrl;
    private readonly string _returnUrl;

    public VnPayService(IConfiguration configuration)
    {
        var cfg = configuration.GetSection("VnPay");
        _tmnCode = cfg["TmnCode"] ?? throw new ArgumentNullException("VnPay:TmnCode");
        _hashSecret = cfg["HashSecret"] ?? throw new ArgumentNullException("VnPay:HashSecret");
        _paymentUrl = cfg["PaymentUrl"] ?? "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
        _returnUrl = cfg["ReturnUrl"] ?? throw new ArgumentNullException("VnPay:ReturnUrl");
    }
    public string CreatePaymentUrl(string txnRef, long amountVnd, string ipAddress, string? orderInfo = null)
    {
        // VNPAY yêu cầu số tiền * 100
        var vnpAmount = checked(amountVnd * 100L);

        // Thời gian theo GMT+7
        var nowGmt7 = DateTime.UtcNow.AddHours(7);
        var createDate = nowGmt7.ToString("yyyyMMddHHmmss");
        var expireDate = nowGmt7.AddMinutes(15).ToString("yyyyMMddHHmmss"); // bắt buộc

        var vnp = new SortedDictionary<string, string>
        {
            ["vnp_Version"] = "2.1.0",
            ["vnp_Command"] = "pay",
            ["vnp_TmnCode"] = _tmnCode,
            ["vnp_Amount"] = vnpAmount.ToString(),          // ✅ amount * 100
            ["vnp_CurrCode"] = "VND",
            ["vnp_TxnRef"] = txnRef,
            ["vnp_OrderInfo"] = orderInfo ?? $"Topup {txnRef}",
            ["vnp_OrderType"] = "other",                       // ✅ bắt buộc
            ["vnp_Locale"] = "vn",
            ["vnp_ReturnUrl"] = _returnUrl,
            ["vnp_IpAddr"] = ipAddress,
            ["vnp_CreateDate"] = createDate,
            ["vnp_ExpireDate"] = expireDate                     // ✅ bắt buộc
        };

        var qs = string.Join("&", vnp.Select(kv => $"{Encode(kv.Key)}={Encode(kv.Value)}"));
        var hash = HmacSha512(_hashSecret, qs);
        return $"{_paymentUrl}?{qs}&vnp_SecureHash={hash}";
    }


    public bool ValidateSecureHash(IDictionary<string, string> queryParams)
    {
        var dict = queryParams
            .Where(kv => kv.Key != "vnp_SecureHash" && kv.Key != "vnp_SecureHashType")
            .ToDictionary(kv => kv.Key, kv => kv.Value);

        var sorted = new SortedDictionary<string, string>(dict);
        var data = string.Join("&", sorted.Select(kv => $"{Encode(kv.Key)}={Encode(kv.Value)}"));
        var expected = HmacSha512(_hashSecret, data);
        var returned = queryParams.TryGetValue("vnp_SecureHash", out var v) ? v : string.Empty;
        return string.Equals(expected, returned, StringComparison.OrdinalIgnoreCase);
    }

    private static string HmacSha512(string key, string input)
    {
        using var hmac = new HMACSHA512(Encoding.UTF8.GetBytes(key));
        var bytes = hmac.ComputeHash(Encoding.UTF8.GetBytes(input));
        return BitConverter.ToString(bytes).Replace("-", "").ToUpperInvariant();
    }

    private static string Encode(string s) => System.Net.WebUtility.UrlEncode(s).Replace("%20", "+");
}
