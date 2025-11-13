using LanServe.Application.Interfaces.Repositories;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;
using System.Web;

namespace LanServe.Application.Services
{
    public class ProposalService : IProposalService
    {
        private readonly IProposalRepository _repo;
        private readonly IMessageRepository _msgRepo;
        private readonly IProjectRepository _projectRepo;
        private readonly IUserRepository _userRepo;

        public ProposalService(IProposalRepository repo,
        IMessageRepository msgRepo,
        IProjectRepository projectRepo,
        IUserRepository userRepo)
        {
            _repo = repo;
            _msgRepo = msgRepo;
            _projectRepo = projectRepo;
            _userRepo = userRepo;
        }

        public Task<Proposal?> GetByIdAsync(string id) => _repo.GetByIdAsync(id);
        public Task<IEnumerable<Proposal>> GetByProjectIdAsync(string projectId) => _repo.GetByProjectIdAsync(projectId);
        public Task<IEnumerable<Proposal>> GetByFreelancerIdAsync(string freelancerId) => _repo.GetByFreelancerIdAsync(freelancerId);
        public Task<Proposal> CreateAsync(Proposal entity) => _repo.CreateAsync(entity);
        public Task<Proposal?> UpdateStatusAsync(string id, string status) => _repo.UpdateStatusAsync(id, status);
        public Task<bool> DeleteAsync(string id) => _repo.DeleteAsync(id);
        public Task<Proposal?> UpdateBidAsync(string proposalId, decimal newBid)
            => _repo.UpdateBidAsync(proposalId, newBid);
        public async Task<string?> GetProjectOwnerAsync(string projectId)
        {
            var project = await _repo.GetByIdAsync(projectId);
            return project?.FreelancerId;
        }
        public async Task<Proposal?> UpdateBidAndRefreshMessageAsync(string proposalId, decimal newBid)
        {
            // 1) Update giá
            var updated = await UpdateBidAsync(proposalId, newBid);
            if (updated is null) return null;

            // 2) Lấy thông tin để dựng lại card
            var project = await _projectRepo.GetByIdAsync(updated.ProjectId);
            var clientId = project?.OwnerId ?? await GetProjectOwnerAsync(updated.ProjectId) ?? "";
            var freelancerId = updated.FreelancerId;

            var projectTitle = project?.Title ?? "";
            var clientName = (await _userRepo.GetByIdAsync(clientId))?.FullName ?? clientId;
            var freelancerName = (await _userRepo.GetByIdAsync(freelancerId))?.FullName ?? freelancerId;

            // 3) Xoá các message cũ có chứa proposalId trong HTML
            await _msgRepo.DeleteByProposalIdInHtmlAsync(proposalId);

            // 4) Tạo message mới (card HTML) với giá mới
            var safeProject = HttpUtility.HtmlEncode(projectTitle);
            var safeClient = HttpUtility.HtmlEncode(clientName);
            var safeFreelancer = HttpUtility.HtmlEncode(freelancerName);
            var priceStr = (updated.BidAmount ?? 0).ToString("N0");

            // build conversationKey: {projectId}:{min(user1,user2)}:{max(user1,user2)}
            var u1 = string.CompareOrdinal(clientId, freelancerId) <= 0 ? clientId : freelancerId;
            var u2 = ReferenceEquals(u1, clientId) ? freelancerId : clientId;
            var convKey = $"{updated.ProjectId}:{u1}:{u2}";

            var html = $@"
<div class='proposal-card' data-proposal-id='{updated.Id}' data-project-id='{updated.ProjectId}'>
  <div style='font-weight:600;margin-bottom:6px;'>Đề xuất cho dự án: {safeProject}</div>
  <div style='font-size:13px;color:#475569;margin-bottom:4px;'>Người gửi: {safeFreelancer}</div>
  <div style='font-size:13px;margin-bottom:10px;'>Giá đề xuất: <b>{priceStr} đ</b></div>
  <div style='margin-top:8px;color:#64748b;font-size:12px;'>LanServe</div>
</div>";

            var newMsg = new Message
            {
                ConversationKey = convKey,
                ProjectId = updated.ProjectId,
                SenderId = freelancerId,
                ReceiverId = clientId,
                Text = html,
                CreatedAt = DateTime.UtcNow, // message mới → thời gian mới
                IsRead = false
            };

            await _msgRepo.AddAsync(newMsg);
            return updated;
        }
        // ProposalService.cs
        public async Task<Proposal?> CancelAndRefreshMessageAsync(string proposalId)
        {
            // 1) Update status -> Cancelled
            var updated = await UpdateStatusAsync(proposalId, "Cancelled");
            if (updated is null) return null;

            // 2) Resolve context
            var project = await _projectRepo.GetByIdAsync(updated.ProjectId);
            var clientId = project?.OwnerId ?? await GetProjectOwnerAsync(updated.ProjectId) ?? "";
            var freelancerId = updated.FreelancerId;

            var projectTitle = project?.Title ?? "";
            var clientName = (await _userRepo.GetByIdAsync(clientId))?.FullName ?? clientId;
            var freelancerName = (await _userRepo.GetByIdAsync(freelancerId))?.FullName ?? freelancerId;

            // 3) Xoá các message nhúng cũ của proposal này
            await _msgRepo.DeleteByProposalIdInHtmlAsync(proposalId);

            // 4) Tạo message nhúng mới: "Đã hủy đề xuất"
            var safeProject = System.Web.HttpUtility.HtmlEncode(projectTitle);
            var safeFreelancer = System.Web.HttpUtility.HtmlEncode(freelancerName);

            // conversationKey: {projectId}:{min(user1,user2)}:{max(user1,user2)}
            var u1 = string.CompareOrdinal(clientId, freelancerId) <= 0 ? clientId : freelancerId;
            var u2 = ReferenceEquals(u1, clientId) ? freelancerId : clientId;
            var convKey = $"{updated.ProjectId}:{u1}:{u2}";

            var html = $@"
<div class='proposal-card' data-proposal-id='{updated.Id}' data-project-id='{updated.ProjectId}'>
  <div style='font-weight:600;margin-bottom:6px;'>Đề xuất cho dự án: {safeProject}</div>
  <div style='font-size:13px;color:#475569;margin-bottom:6px;'>Người gửi: {safeFreelancer}</div>
  <div style='padding:10px;border:1px solid #fecaca;background:#fef2f2;color:#b91c1c;border-radius:8px;'>
    Đề xuất này đã <b>HỦY</b>.
  </div>
  <div style='margin-top:8px;color:#64748b;font-size:12px;'>LanServe</div>
</div>";

            var newMsg = new Message
            {
                ConversationKey = convKey,
                ProjectId = updated.ProjectId,
                SenderId = freelancerId,  // người đề xuất là người "phát" thông báo hủy
                ReceiverId = clientId,
                Text = html,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            await _msgRepo.AddAsync(newMsg);
            return updated;
        }
        public async Task<Message> CreateAcceptedMessageAsync(Proposal proposal, Contract contract)
        {
            // Resolve bối cảnh
            var project = await _projectRepo.GetByIdAsync(proposal.ProjectId);
            var clientId = project?.OwnerId ?? await GetProjectOwnerAsync(proposal.ProjectId) ?? "";
            var freelancerId = proposal.FreelancerId;

            // Xoá mọi message nhúng cũ của proposal này
            await _msgRepo.DeleteByProposalIdInHtmlAsync(proposal.Id); // repo đã có sẵn API này :contentReference[oaicite:1]{index=1}

            // Build key {projectId}:{min}:{max}
            var u1 = string.CompareOrdinal(clientId, freelancerId) <= 0 ? clientId : freelancerId;
            var u2 = ReferenceEquals(u1, clientId) ? freelancerId : clientId;
            var convKey = $"{proposal.ProjectId}:{u1}:{u2}";

            // Escape text cơ bản
            var safeProject = HttpUtility.HtmlEncode(project?.Title ?? "");
            var priceStr = (proposal.BidAmount ?? 0).ToString("N0");

            // Card “Accepted” + nút xem hợp đồng
            var html = $@"
<div class='proposal-card' data-proposal-id='{proposal.Id}' data-project-id='{proposal.ProjectId}'>
  <div style='font-weight:600;margin-bottom:6px;'>Đề xuất đã <span style=""color:#16a34a""><b>ĐƯỢC CHẤP NHẬN</b></span> cho dự án: {safeProject}</div>
  <div style='font-size:13px;margin:8px 0;'>Giá thỏa thuận: <b>{priceStr} đ</b></div>
  <div class='actions' style='margin-top:8px;display:flex;gap:8px;'>
    <button data-action='view-contract' data-contract-id='{contract.Id}' class='btn btn-sm btn-primary'>📄 Xem hợp đồng</button>
  </div>
  <div style='margin-top:8px;color:#64748b;font-size:12px;'>LanServe</div>
</div>";

            var msg = new Message
            {
                ConversationKey = convKey,
                ProjectId = proposal.ProjectId,
                SenderId = clientId,      // tuỳ bạn, có thể để client “phát” thông báo
                ReceiverId = freelancerId,
                Text = html,
                CreatedAt = DateTime.UtcNow,
                IsRead = false
            };

            return await _msgRepo.AddAsync(msg);
        }
    }
}
