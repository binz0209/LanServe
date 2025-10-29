// LanServe.Domain/Entities/Payment.cs
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LanServe.Domain.Entities;

public class Payment
{
    [BsonId, BsonRepresentation(BsonType.ObjectId)]
    public string Id { get; set; } = null!;

    [BsonElement("contractId"), BsonRepresentation(BsonType.ObjectId)]
    public string? ContractId { get; set; }  // có thể null khi nạp ví

    [BsonElement("userId"), BsonRepresentation(BsonType.ObjectId)]
    public string UserId { get; set; } = null!;

    [BsonElement("walletId"), BsonRepresentation(BsonType.ObjectId)]
    public string? WalletId { get; set; }     // id ví dùng khi topup

    [BsonElement("purpose")]                  // TopUp / Contract
    public string Purpose { get; set; } = "TopUp";

    [BsonElement("amount")]
    public decimal Amount { get; set; }       // decimal theo file gốc

    [BsonElement("currency")]
    public string Currency { get; set; } = "VND";

    [BsonElement("status")]
    public string Status { get; set; } = "Pending"; // Pending/Paid/Failed

    [BsonElement("createdAt")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [BsonElement("paidAt")]
    public DateTime? PaidAt { get; set; }

    // ===== VNPAY fields =====
    [BsonElement("vnp_TxnRef")]
    public string? Vnp_TxnRef { get; set; }

    [BsonElement("vnp_TransactionNo")]
    public string? Vnp_TransactionNo { get; set; }

    [BsonElement("vnp_ResponseCode")]
    public string? Vnp_ResponseCode { get; set; }

    [BsonElement("vnp_BankCode")]
    public string? Vnp_BankCode { get; set; }

    [BsonElement("vnp_CardType")]
    public string? Vnp_CardType { get; set; }

    [BsonElement("vnp_PayDate")]
    public string? Vnp_PayDate { get; set; } // yyyyMMddHHmmss

    [BsonElement("vnp_SecureHash")]
    public string? Vnp_SecureHash { get; set; }

    [BsonElement("vnp_RawQuery")]
    public string? Vnp_RawQuery { get; set; }
}
