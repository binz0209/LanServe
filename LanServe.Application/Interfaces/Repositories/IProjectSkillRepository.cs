using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Repositories
{
    public interface IProjectSkillRepository
    {
        Task<ProjectSkill> CreateAsync(ProjectSkill entity);
        Task<bool> DeleteAsync(string id);

        Task<IReadOnlyList<ProjectSkill>> GetByProjectIdAsync(string projectId);
        Task<IReadOnlyList<ProjectSkill>> GetBySkillIdAsync(string skillId);

        Task<bool> ExistsAsync(string projectId, string skillId);

        // Tùy chọn: sync 1 shot (xóa cái thừa, thêm cái thiếu) theo danh sách skillIds
        Task<(int added, int removed)> SyncForProjectAsync(string projectId, IEnumerable<string> skillIds);
    }
}
