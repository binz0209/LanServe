// LanServe.Application/Interfaces/Services/IPaymentService.cs
namespace LanServe.Application.Interfaces.Services;

public interface IPaymentService
{
    Task<string> CreateTopUpAsync(string userId, decimal amount, string ip, CancellationToken ct = default);
    Task<(bool ok, string redirect)> HandleVnPayReturnAsync(IDictionary<string, string> queryParams, CancellationToken ct = default);
}
