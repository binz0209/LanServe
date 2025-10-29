using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Repositories;

public interface IProjectRepository
{
    Task<IEnumerable<Project>> GetAllAsync();
    Task<IEnumerable<Project>> GetByStatusAsync(string status);
    Task<Project?> GetByIdAsync(string id);
    Task<IEnumerable<Project>> GetByOwnerIdAsync(string ownerId);
    Task<IEnumerable<Project>> GetOpenProjectsAsync();
    Task<Project> InsertAsync(Project entity);
    Task<bool> UpdateAsync(Project entity);
    Task<bool> DeleteAsync(string id);
    Task<Project?> UpdateStatusAsync(string id, string newStatus);
}
