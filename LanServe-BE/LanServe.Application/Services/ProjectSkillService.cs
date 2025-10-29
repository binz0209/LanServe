using LanServe.Application.Interfaces.Repositories;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;

namespace LanServe.Application.Services
{
    public class ProjectSkillService : IProjectSkillService
    {
        private readonly IProjectSkillRepository _repo;

        public ProjectSkillService(IProjectSkillRepository repo)
        {
            _repo = repo;
        }

        public Task<ProjectSkill> CreateAsync(ProjectSkill dto)
        {
            // Bạn có thể thêm validate: projectId/skillId not null
            if (string.IsNullOrWhiteSpace(dto.ProjectId))
                throw new ArgumentException("ProjectId is required");
            if (string.IsNullOrWhiteSpace(dto.SkillId))
                throw new ArgumentException("SkillId is required");

            return _repo.CreateAsync(dto);
        }

        public Task<bool> DeleteAsync(string id) => _repo.DeleteAsync(id);

        public Task<IReadOnlyList<ProjectSkill>> GetByProjectIdAsync(string projectId)
            => _repo.GetByProjectIdAsync(projectId);

        public Task<IReadOnlyList<ProjectSkill>> GetBySkillIdAsync(string skillId)
            => _repo.GetBySkillIdAsync(skillId);

        public Task<(int added, int removed)> SyncForProjectAsync(string projectId, IEnumerable<string> skillIds)
            => _repo.SyncForProjectAsync(projectId, skillIds);
    }
}
