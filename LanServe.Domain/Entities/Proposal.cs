using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace LanServe.Domain.Entities
{
    public class Proposal
    {
        [BsonId, BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; } = null!;

        [BsonElement("projectId"), BsonRepresentation(BsonType.ObjectId)]
        public string ProjectId { get; set; } = null!;

        [BsonElement("freelancerId"), BsonRepresentation(BsonType.ObjectId)]
        public string FreelancerId { get; set; } = null!; // User.Id

        [BsonElement("coverLetter")]
        public string CoverLetter { get; set; } = string.Empty;

        [BsonElement("bidAmount")]
        public decimal? BidAmount { get; set; }

        [BsonElement("status")]
        public string Status { get; set; } = "Pending"; // Pending/Accepted/Rejected

        [BsonElement("createdAt")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
