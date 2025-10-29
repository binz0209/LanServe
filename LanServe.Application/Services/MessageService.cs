// LanServe.Application/Services/MessageService.cs
using LanServe.Application.Interfaces.Repositories;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;
using System.Web;

public class MessageService : IMessageService
{
    private readonly IMessageRepository _repo;
    public MessageService(IMessageRepository repo) => _repo = repo;

    public Task<IEnumerable<Message>> GetByConversationAsync(string conversationKey)
        => _repo.GetByConversationAsync(conversationKey).ContinueWith(t => (IEnumerable<Message>)t.Result);

    public Task<IEnumerable<Message>> GetByProjectAsync(string projectId)
        => _repo.GetByProjectAsync(projectId).ContinueWith(t => (IEnumerable<Message>)t.Result);

    public Task<IEnumerable<Message>> GetByUserAsync(string userId)
        => _repo.GetByUserAsync(userId).ContinueWith(t => (IEnumerable<Message>)t.Result);

    public async Task<IEnumerable<(string ConversationKey, string PartnerId, string LastMessage, DateTime LastAt, int UnreadCount)>>
        GetConversationsForUserAsync(string userId)
        => await _repo.GetConversationsForUserAsync(userId);

    public async Task<Message> SendAsync(Message dto)
    {
        // ✅ CHUẨN HOÁ conversationKey nếu thiếu
        if (string.IsNullOrWhiteSpace(dto.ConversationKey)
            && !string.IsNullOrWhiteSpace(dto.SenderId)
            && !string.IsNullOrWhiteSpace(dto.ReceiverId))
        {
            dto.ConversationKey = BuildConversationKey(dto.ProjectId, dto.SenderId, dto.ReceiverId);
        }

        dto.CreatedAt = dto.CreatedAt == default ? DateTime.UtcNow : dto.CreatedAt;
        dto.IsRead = false;

        return await _repo.AddAsync(dto);
    }

    public Task<bool> MarkAsReadAsync(string id) => _repo.MarkAsReadAsync(id);

    // ✅ CHUẨN: {projectId ?? "null"}:{min(sender,receiver)}:{max(sender,receiver)}
    private static string BuildConversationKey(string? projectId, string a, string b)
    {
        var u1 = string.CompareOrdinal(a, b) <= 0 ? a : b;
        var u2 = ReferenceEquals(u1, a) ? b : a;
        var pid = string.IsNullOrWhiteSpace(projectId) ? "null" : projectId;
        return $"{pid}:{u1}:{u2}";
    }
    public async Task<Message> CreateProposalMessageAsync(
        string projectId,
        string proposalId,
        string clientId,
        string freelancerId,
        string projectTitle,
        string clientName,
        string freelancerName,
        string coverLetter,
        decimal? bidAmount
    )
    {
        // ConversationKey: gom theo project + 2 user để gom đúng cuộc trò chuyện
        var u1 = string.CompareOrdinal(clientId, freelancerId) < 0 ? clientId : freelancerId;
        var u2 = string.CompareOrdinal(clientId, freelancerId) < 0 ? freelancerId : clientId;
        var convKey = $"{projectId}:{u1}:{u2}";

        // Dựng HTML (escape coverLetter để tránh XSS cơ bản)
        var safeLetter = HttpUtility.HtmlEncode(coverLetter ?? "");
        var safeProject = HttpUtility.HtmlEncode(projectTitle ?? "");
        var safeClient = HttpUtility.HtmlEncode(clientName ?? "");
        var safeFreelancer = HttpUtility.HtmlEncode(freelancerName ?? "");
        var priceStr = (bidAmount.HasValue ? bidAmount.Value : 0).ToString("N0");

        var html = $@"
<div class='proposal-card' data-proposal-id='{proposalId}' data-project-id='{projectId}'>
  <div style='font-weight:600;margin-bottom:6px;'>Đề xuất cho dự án: {safeProject}</div>
  <div style='font-size:13px;color:#475569;margin-bottom:4px;'>Người gửi: {safeFreelancer}</div>
  <div style='white-space:pre-wrap;border:1px solid #e2e8f0;border-radius:8px;padding:10px;background:#f8fafc;margin:8px 0;'>{safeLetter}</div>
  <div style='font-size:13px;margin-bottom:10px;'>Giá đề xuất: <b>{priceStr} đ</b></div>

  <div style='margin-top:8px;color:#64748b;font-size:12px;'>
    LanServe
  </div>
</div>";

        var message = new Message
        {
            ConversationKey = convKey,
            ProjectId = projectId,
            SenderId = freelancerId,   // freelancer là người gửi đề xuất
            ReceiverId = clientId,     // client là người nhận
            Text = html,
            CreatedAt = DateTime.UtcNow,
            IsRead = false
        };

        return await _repo.AddAsync(message);
    }
}
