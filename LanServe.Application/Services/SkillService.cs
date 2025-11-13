using LanServe.Application.Interfaces.Repositories;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;

namespace LanServe.Application.Services;

public class SkillService : ISkillService
{
    private readonly ISkillRepository _repo;

    public SkillService(ISkillRepository repo)
    {
        _repo = repo;
    }

    public Task<IEnumerable<Skill>> GetAllAsync()
        => _repo.GetAllAsync();

    public Task<IEnumerable<Skill>> GetByCategoryIdAsync(string categoryId)
        => _repo.GetByCategoryIdAsync(categoryId);

    public Task<Skill?> GetByIdAsync(string id)
        => _repo.GetByIdAsync(id);

    public Task<Skill> CreateAsync(Skill entity)
        => _repo.InsertAsync(entity);

    public async Task<bool> UpdateAsync(string id, Skill entity)
    {
        entity.Id = id;
        return await _repo.UpdateAsync(entity);
    }

    public Task<bool> DeleteAsync(string id)
        => _repo.DeleteAsync(id);
    public async Task<List<Skill>> GetByIdsAsync(List<string> ids)
    {
        return await _repo.GetByIdsAsync(ids);
    }
}
