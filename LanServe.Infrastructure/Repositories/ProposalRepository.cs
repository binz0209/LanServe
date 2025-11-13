using LanServe.Application.Interfaces.Repositories;
using LanServe.Domain.Entities;
using LanServe.Infrastructure.Data;
using MongoDB.Driver;

namespace LanServe.Infrastructure.Repositories
{
    public class ProposalRepository : IProposalRepository
    {
        private readonly IMongoCollection<Proposal> _col;

        public ProposalRepository(IMongoCollection<Proposal> col)
        {
            _col = col;
        }

        public async Task<Proposal?> GetByIdAsync(string id) =>
            await _col.Find(x => x.Id == id).FirstOrDefaultAsync();

        public async Task<IEnumerable<Proposal>> GetByProjectIdAsync(string projectId) =>
            await _col.Find(x => x.ProjectId == projectId).ToListAsync();

        public async Task<IEnumerable<Proposal>> GetByFreelancerIdAsync(string freelancerId) =>
            await _col.Find(x => x.FreelancerId == freelancerId).ToListAsync();

        public async Task<Proposal> CreateAsync(Proposal entity)
        {
            await _col.InsertOneAsync(entity);
            return entity;
        }

        public async Task<Proposal?> UpdateStatusAsync(string id, string status)
        {
            var update = Builders<Proposal>.Update.Set(x => x.Status, status);
            return await _col.FindOneAndUpdateAsync(x => x.Id == id, update, new FindOneAndUpdateOptions<Proposal> { ReturnDocument = ReturnDocument.After });
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var result = await _col.DeleteOneAsync(x => x.Id == id);
            return result.DeletedCount > 0;
        }
        public async Task<Proposal?> UpdateBidAsync(string proposalId, decimal newBid)
        {
            var update = Builders<Proposal>.Update
                .Set(p => p.BidAmount, newBid)
                .Set(p => p.CreatedAt, DateTime.UtcNow);

            return await _col.FindOneAndUpdateAsync(
                p => p.Id == proposalId,
                update,
                new FindOneAndUpdateOptions<Proposal> { ReturnDocument = ReturnDocument.After }
            );
        }
    }
}
