using LanServe.Application.Interfaces.Repositories;
using LanServe.Domain.Entities;
using MongoDB.Driver;

namespace LanServe.Infrastructure.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly IMongoCollection<Payment> _collection;

    public PaymentRepository(IMongoCollection<Payment> collection)
    {
        _collection = collection;
    }

    public async Task<Payment?> GetByTxnRefAsync(string txnRef, CancellationToken ct = default)
        => await _collection.Find(x => x.Vnp_TxnRef == txnRef).FirstOrDefaultAsync(ct);

    public async Task<Payment> InsertAsync(Payment payment, CancellationToken ct = default)
    {
        await _collection.InsertOneAsync(payment, cancellationToken: ct);
        return payment;
    }

    public async Task UpdateAsync(Payment payment, CancellationToken ct = default)
        => await _collection.ReplaceOneAsync(x => x.Id == payment.Id, payment, cancellationToken: ct);
}
