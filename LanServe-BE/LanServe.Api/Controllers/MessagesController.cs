// LanServe.Api/Controllers/MessagesController.cs
using LanServe.Application.DTOs.Messages;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using System.Security.Claims;
using System.Text.Json;

namespace LanServe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MessagesController : ControllerBase
{
    private readonly IMessageService _svc;
    public MessagesController(IMessageService svc) { _svc = svc; }

    private string? GetUserId()
        => User.FindFirst(ClaimTypes.NameIdentifier)?.Value
           ?? User.FindFirst("sub")?.Value
           ?? User.FindFirst("http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier")?.Value;

    // NEW: trả toàn bộ tin nhắn của user
    [Authorize]
    [HttpGet("my")]
    public async Task<IActionResult> MyMessages()
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var list = await _svc.GetByUserAsync(userId);
        return Ok(list);
    }

    // NEW: trả danh sách hội thoại đã group (không tạo DTO ngoài)
    [Authorize]
    [HttpGet("my-conversations")]
    public async Task<IActionResult> MyConversations()
    {
        var userId = GetUserId();
        if (string.IsNullOrWhiteSpace(userId)) return Unauthorized();

        var convos = await _svc.GetConversationsForUserAsync(userId);

        // Trả object ẩn danh đúng shape cho FE
        var result = convos.Select(c => new {
            conversationKey = c.ConversationKey,
            partnerId = c.PartnerId,
            lastMessage = c.LastMessage,
            lastAt = c.LastAt,
            unreadCount = c.UnreadCount
        });

        return Ok(result);
    }

    [Authorize]
    [HttpGet("thread/{conversationKey}")]
    public async Task<IActionResult> Thread(string conversationKey)
        => Ok(await _svc.GetByConversationAsync(conversationKey));

    [Authorize]
    [HttpGet("project/{projectId}")]
    public async Task<IActionResult> ByProject(string projectId)
        => Ok(await _svc.GetByProjectAsync(projectId));

    public class SendMessageRequest
    {
        public string? ConversationKey { get; set; }    // optional
        public string ReceiverId { get; set; } = null!;
        public string Text { get; set; } = null!;
        public string? ProjectId { get; set; }          // optional
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> Send([FromBody] SendMessageRequest body)
    {
        var senderId = GetUserId();
        if (string.IsNullOrEmpty(senderId)) return Unauthorized();

        if (string.IsNullOrWhiteSpace(body.ReceiverId) || string.IsNullOrWhiteSpace(body.Text))
            return BadRequest("receiverId và text là bắt buộc.");

        // Nếu FE truyền sẵn conversationKey thì dùng luôn; nếu không -> build chuẩn 3 phần
        var convKey = !string.IsNullOrWhiteSpace(body.ConversationKey)
            ? body.ConversationKey!
            : BuildKey(body.ProjectId, senderId, body.ReceiverId);

        var msg = new Message
        {
            SenderId = senderId,
            ReceiverId = body.ReceiverId,
            ProjectId = string.IsNullOrWhiteSpace(body.ProjectId) ? null : body.ProjectId,
            Text = body.Text,
            CreatedAt = DateTime.UtcNow,
            IsRead = false,
            ConversationKey = convKey
        };

        var saved = await _svc.SendAsync(msg);
        return Ok(saved);

        // local helper: đảm bảo cùng format với Service/Repo
        static string BuildKey(string? projectId, string a, string b)
        {
            var u1 = string.CompareOrdinal(a, b) <= 0 ? a : b;
            var u2 = ReferenceEquals(u1, a) ? b : a;
            var pid = string.IsNullOrWhiteSpace(projectId) ? "null" : projectId;
            return $"{pid}:{u1}:{u2}";
        }
    }


    [Authorize]
    [HttpPost("{id}/read")]
    public async Task<IActionResult> MarkRead(string id)
        => Ok(await _svc.MarkAsReadAsync(id));

    [Authorize(Roles = "User,Admin")]
    [HttpPost("proposal")]
    public async Task<IActionResult> CreateProposalMessage([FromBody] ProposalMessageCreateDto dto)
    {
        Console.WriteLine("== CreateProposalMessage payload ==");
        Console.WriteLine(JsonSerializer.Serialize(dto));

        if (string.IsNullOrWhiteSpace(dto.ProjectId) ||
            string.IsNullOrWhiteSpace(dto.ProposalId) ||
            string.IsNullOrWhiteSpace(dto.ClientId) ||
            string.IsNullOrWhiteSpace(dto.FreelancerId))
        {
            return BadRequest(new { message = "Missing required fields (ProjectId/ProposalId/ClientId/FreelancerId)." });
        }

        var msg = await _svc.CreateProposalMessageAsync(
            dto.ProjectId,
            dto.ProposalId,
            dto.ClientId,
            dto.FreelancerId,
            dto.ProjectTitle ?? string.Empty,
            dto.ClientName ?? string.Empty,
            dto.FreelancerName ?? string.Empty,
            dto.CoverLetter ?? string.Empty,
            dto.BidAmount
        );

        return Ok(msg);
    }
}
