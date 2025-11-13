using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Services;

public interface IProjectService
{
    Task<IEnumerable<Project>> GetAllAsync();
    Task<IEnumerable<Project>> GetByStatusAsync(string status);
    Task<Project?> GetByIdAsync(string id);
    Task<IEnumerable<Project>> GetByOwnerIdAsync(string ownerId);
    Task<IEnumerable<Project>> GetOpenProjectsAsync();
    Task<Project> CreateAsync(Project entity);
    Task<bool> UpdateAsync(string id, Project entity);
    Task<bool> DeleteAsync(string id);
    Task<Project?> UpdateStatusAsync(string id, string newStatus);
}
