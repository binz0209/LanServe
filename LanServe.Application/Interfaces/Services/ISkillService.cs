using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Services;

public interface ISkillService
{
    Task<IEnumerable<Skill>> GetAllAsync();
    Task<IEnumerable<Skill>> GetByCategoryIdAsync(string categoryId);
    Task<Skill?> GetByIdAsync(string id);
    Task<Skill> CreateAsync(Skill entity);
    Task<bool> UpdateAsync(string id, Skill entity);
    Task<bool> DeleteAsync(string id);
    Task<List<Skill>> GetByIdsAsync(List<string> ids);
}
