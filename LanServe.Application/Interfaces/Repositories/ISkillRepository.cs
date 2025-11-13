using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Repositories;

public interface ISkillRepository
{
    Task<IEnumerable<Skill>> GetAllAsync();
    Task<IEnumerable<Skill>> GetByCategoryIdAsync(string categoryId);
    Task<Skill?> GetByIdAsync(string id);
    Task<Skill> InsertAsync(Skill entity);
    Task<bool> UpdateAsync(Skill entity);
    Task<bool> DeleteAsync(string id);
    Task<List<Skill>> GetByIdsAsync(List<string> ids);
}
