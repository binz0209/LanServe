// LanServe.Application/Interfaces/Repositories/IMessageRepository.cs
using LanServe.Domain.Entities;

namespace LanServe.Application.Interfaces.Repositories;

public interface IMessageRepository
{
    Task<Message> AddAsync(Message message);
    Task<bool> MarkAsReadAsync(string id);

    Task<List<Message>> GetByConversationAsync(string conversationKey);
    Task<List<Message>> GetByProjectAsync(string projectId);
    Task<List<Message>> GetByUserAsync(string userId);

    // Trả danh sách hội thoại đã group (tuple, không tạo DTO)
    Task<List<(string ConversationKey, string PartnerId, string LastMessage, DateTime LastAt, int UnreadCount)>>
        GetConversationsForUserAsync(string userId);

    Task<long> DeleteByProposalIdInHtmlAsync(string proposalId);
}
