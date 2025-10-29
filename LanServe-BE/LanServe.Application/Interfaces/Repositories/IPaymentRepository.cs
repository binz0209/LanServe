// LanServe.Application/Interfaces/Repositories/IPaymentRepository.cs
using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Repositories;

public interface IPaymentRepository
{
    Task<Payment?> GetByTxnRefAsync(string txnRef, CancellationToken ct = default);
    Task<IEnumerable<Payment>> GetAllAsync();
    Task<Payment> InsertAsync(Payment payment, CancellationToken ct = default);
    Task UpdateAsync(Payment payment, CancellationToken ct = default);
}
