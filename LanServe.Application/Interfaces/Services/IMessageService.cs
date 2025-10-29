// LanServe.Application/Interfaces/Services/IMessageService.cs
using LanServe.Domain.Entities;

public interface IMessageService
{
    Task<IEnumerable<Message>> GetByConversationAsync(string conversationKey);
    Task<IEnumerable<Message>> GetByProjectAsync(string projectId);
    Task<IEnumerable<Message>> GetByUserAsync(string userId);

    Task<IEnumerable<(string ConversationKey, string PartnerId, string LastMessage, DateTime LastAt, int UnreadCount)>>
        GetConversationsForUserAsync(string userId);

    Task<Message> SendAsync(Message dto);
    Task<bool> MarkAsReadAsync(string id);
    Task<Message> CreateProposalMessageAsync(
        string projectId,
        string proposalId,
        string clientId,
        string freelancerId,
        string projectTitle,
        string clientName,
        string freelancerName,
        string coverLetter,
        decimal? bidAmount
    );
}
