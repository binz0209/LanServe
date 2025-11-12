using LanServe.Application.Interfaces.Repositories;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;

namespace LanServe.Application.Services;

public class ProjectService : IProjectService
{
    private readonly IProjectRepository _repo;
    private readonly IUserProfileService _userProfileService;
    private readonly ISkillService _skillService;
    private readonly IGeminiService _geminiService;
    private readonly IVectorService _vectorService;

    public ProjectService(
        IProjectRepository repo,
        IUserProfileService userProfileService,
        ISkillService skillService,
        IGeminiService geminiService,
        IVectorService vectorService)
    {
        _repo = repo;
        _userProfileService = userProfileService;
        _skillService = skillService;
        _geminiService = geminiService;
        _vectorService = vectorService;
    }
    public Task<IEnumerable<Project>> GetAllAsync() => _repo.GetAllAsync();

    public Task<IEnumerable<Project>> GetByStatusAsync(string status) => _repo.GetByStatusAsync(status);

    public Task<Project?> GetByIdAsync(string id)
        => _repo.GetByIdAsync(id);

    public Task<IEnumerable<Project>> GetByOwnerIdAsync(string ownerId)
        => _repo.GetByOwnerIdAsync(ownerId);

    public Task<IEnumerable<Project>> GetOpenProjectsAsync()
        => _repo.GetOpenProjectsAsync();

    public Task<Project> CreateAsync(Project entity)
    {
        entity.CreatedAt = DateTime.UtcNow;
        entity.Status = "Open";
        return _repo.InsertAsync(entity);
    }

    public async Task<bool> UpdateAsync(string id, Project entity)
    {
        entity.Id = id;
        return await _repo.UpdateAsync(entity);
    }

    public Task<bool> DeleteAsync(string id)
        => _repo.DeleteAsync(id);
    public async Task<Project?> UpdateStatusAsync(string id, string newStatus) =>
        await _repo.UpdateStatusAsync(id, newStatus);

    public async Task<IEnumerable<(Project Project, double Similarity)>> GetRecommendedProjectsAsync(string userId, int limit = 10)
    {
        // 1. Lấy user profile
        var userProfile = await _userProfileService.GetByUserIdAsync(userId);
        if (userProfile == null)
            return Enumerable.Empty<(Project, double)>();

        // 2. Lấy user skills (từ SkillIds)
        HashSet<string> userSkillIds = new();
        HashSet<string> userCategoryIds = new();
        
        if (userProfile.SkillIds != null && userProfile.SkillIds.Count > 0)
        {
            var userSkills = await _skillService.GetByIdsAsync(userProfile.SkillIds);
            foreach (var skill in userSkills)
            {
                userSkillIds.Add(skill.Id);
                if (!string.IsNullOrEmpty(skill.CategoryId))
                {
                    userCategoryIds.Add(skill.CategoryId);
                }
            }
        }

        // Nếu có bio, extract thêm skills từ bio (optional)
        if (!string.IsNullOrWhiteSpace(userProfile.Bio) && userSkillIds.Count == 0)
        {
            try
            {
                var extractedSkills = await _geminiService.ExtractSkillsAsync(userProfile.Bio);
                // Tìm skill IDs từ skill names (có thể bỏ qua nếu không tìm thấy)
                var allSkills = await _skillService.GetAllAsync();
                foreach (var skillName in extractedSkills)
                {
                    var matchedSkill = allSkills.FirstOrDefault(s => 
                        s.Name.Equals(skillName, StringComparison.OrdinalIgnoreCase));
                    if (matchedSkill != null)
                    {
                        userSkillIds.Add(matchedSkill.Id);
                        if (!string.IsNullOrEmpty(matchedSkill.CategoryId))
                        {
                            userCategoryIds.Add(matchedSkill.CategoryId);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error extracting skills from bio: {ex.Message}");
            }
        }

        if (userSkillIds.Count == 0)
            return Enumerable.Empty<(Project, double)>();

        // 3. Lấy tất cả projects mở (Open)
        var openProjects = await _repo.GetOpenProjectsAsync();
        var projectsWithSimilarity = new List<(Project Project, double Similarity)>();

        // 4. Tính similarity cho mỗi project
        foreach (var project in openProjects)
        {
            // Bỏ qua project của chính user
            if (project.OwnerId == userId)
                continue;

            // Lấy project skills
            HashSet<string> projectSkillIds = new();
            if (project.SkillIds != null && project.SkillIds.Count > 0)
            {
                foreach (var skillId in project.SkillIds)
                {
                    projectSkillIds.Add(skillId);
                }
            }

            if (projectSkillIds.Count == 0)
                continue;

            // Tính số skills match
            int matchedSkills = userSkillIds.Intersect(projectSkillIds).Count();
            int totalProjectSkills = projectSkillIds.Count;

            if (matchedSkills == 0)
                continue;

            // Tính % similarity: (số skills match / tổng số skills project cần) * 100
            double similarity = (double)matchedSkills / totalProjectSkills * 100.0;

            // Bonus nếu category match (thêm 10%)
            if (!string.IsNullOrEmpty(project.CategoryId) && userCategoryIds.Contains(project.CategoryId))
            {
                similarity = Math.Min(100.0, similarity + 10.0);
            }

            // Đảm bảo similarity không vượt quá 100%
            similarity = Math.Min(100.0, similarity);

            projectsWithSimilarity.Add((project, similarity));
        }

        // 5. Sort theo similarity (cao nhất trước) và lấy top N
        return projectsWithSimilarity
            .OrderByDescending(x => x.Similarity)
            .Take(limit);
    }
}
