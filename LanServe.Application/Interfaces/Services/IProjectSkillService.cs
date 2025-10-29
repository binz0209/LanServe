using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Services
{
    public interface IProjectSkillService
    {
        Task<ProjectSkill> CreateAsync(ProjectSkill dto);
        Task<bool> DeleteAsync(string id);

        Task<IReadOnlyList<ProjectSkill>> GetByProjectIdAsync(string projectId);
        Task<IReadOnlyList<ProjectSkill>> GetBySkillIdAsync(string skillId);

        // optional: sync
        Task<(int added, int removed)> SyncForProjectAsync(string projectId, IEnumerable<string> skillIds);
    }
}
