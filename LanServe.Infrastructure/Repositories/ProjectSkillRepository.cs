using LanServe.Application.Interfaces.Repositories;
using LanServe.Domain.Entities;
using MongoDB.Bson;
using MongoDB.Driver;

namespace LanServe.Infrastructure.Repositories
{
    public class ProjectSkillRepository : IProjectSkillRepository
    {
        private readonly IMongoCollection<ProjectSkill> _col;

        // 👇 Phù hợp với Program.cs: new ProjectSkillRepository(ctx.ProjectSkills)
        public ProjectSkillRepository(IMongoCollection<ProjectSkill> collection)
        {
            _col = collection;
        }

        public async Task<ProjectSkill> CreateAsync(ProjectSkill entity)
        {
            // Với string Id + BsonRepresentation(ObjectId) thì driver KHÔNG tự generate.
            if (string.IsNullOrWhiteSpace(entity.Id))
                entity.Id = ObjectId.GenerateNewId().ToString();

            await _col.InsertOneAsync(entity);
            return entity;
        }

        public async Task<bool> DeleteAsync(string id)
        {
            var res = await _col.DeleteOneAsync(x => x.Id == id);
            return res.DeletedCount > 0;
        }

        public async Task<IReadOnlyList<ProjectSkill>> GetByProjectIdAsync(string projectId)
        {
            var cur = await _col.Find(x => x.ProjectId == projectId).ToListAsync();
            return cur;
        }

        public async Task<IReadOnlyList<ProjectSkill>> GetBySkillIdAsync(string skillId)
        {
            var cur = await _col.Find(x => x.SkillId == skillId).ToListAsync();
            return cur;
        }

        public async Task<bool> ExistsAsync(string projectId, string skillId)
        {
            var filter = Builders<ProjectSkill>.Filter.And(
                Builders<ProjectSkill>.Filter.Eq(x => x.ProjectId, projectId),
                Builders<ProjectSkill>.Filter.Eq(x => x.SkillId, skillId)
            );
            var count = await _col.CountDocumentsAsync(filter);
            return count > 0;
        }

        // Optional: đồng bộ danh sách skill cho 1 project
        public async Task<(int added, int removed)> SyncForProjectAsync(string projectId, IEnumerable<string> skillIds)
        {
            var target = new HashSet<string>(skillIds ?? Enumerable.Empty<string>());

            // lấy hiện có
            var existing = await GetByProjectIdAsync(projectId);
            var existingSet = existing.Select(x => x.SkillId).ToHashSet();

            var toAdd = target.Except(existingSet).ToList();
            var toRemove = existing.Where(x => !target.Contains(x.SkillId)).Select(x => x.Id).ToList();

            // insert bulk
            if (toAdd.Count > 0)
            {
                var docs = toAdd.Select(sid => new ProjectSkill
                {
                    Id = ObjectId.GenerateNewId().ToString(),
                    ProjectId = projectId,
                    SkillId = sid
                }).ToList();

                await _col.InsertManyAsync(docs);
            }

            // delete bulk
            if (toRemove.Count > 0)
            {
                var delFilter = Builders<ProjectSkill>.Filter.In(x => x.Id, toRemove);
                await _col.DeleteManyAsync(delFilter);
            }

            return (toAdd.Count, toRemove.Count);
        }
    }
}
