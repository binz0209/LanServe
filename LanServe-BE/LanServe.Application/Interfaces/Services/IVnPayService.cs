// LanServe.Application/Interfaces/Services/IVnPayService.cs
namespace LanServe.Application.Interfaces.Services;

public interface IVnPayService
{
    string CreatePaymentUrl(string txnRef, long amount, string ipAddress, string? orderInfo = null);
    bool ValidateSecureHash(IDictionary<string, string> queryParams);
}
