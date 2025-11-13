using LanServe.Application.DTOs;
using LanServe.Application.Interfaces.Services;
using LanServe.Application.Services;
using LanServe.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Bson;
using System.Security.Claims;

namespace LanServe.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProposalsController : ControllerBase
    {
        private readonly IProposalService _svc;
        private readonly IContractService _contractService;
        private readonly IProjectService _projectService;
        public ProposalsController(IProposalService svc, IContractService contractService, IProjectService projectService)
        {
            _svc = svc;
            _contractService = contractService;
            _projectService = projectService;
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(string id)
            => Ok(await _svc.GetByIdAsync(id));

        [HttpGet("by-project/{projectId}")]
        public async Task<IActionResult> ByProject(string projectId)
            => Ok(await _svc.GetByProjectIdAsync(projectId));

        [HttpGet("by-freelancer/{freelancerId}")]
        public async Task<IActionResult> ByFreelancer(string freelancerId)
            => Ok(await _svc.GetByFreelancerIdAsync(freelancerId));

        // ================== CREATE PROPOSAL ==================
        [Authorize(Roles = "User,Admin")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateProposalDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.ProjectId) || string.IsNullOrWhiteSpace(dto.FreelancerId))
                return BadRequest("ProjectId and FreelancerId are required");

            var proposal = new Proposal
            {
                ProjectId = dto.ProjectId,
                FreelancerId = dto.FreelancerId,
                CoverLetter = dto.CoverLetter ?? "",
                BidAmount = dto.BidAmount,
                Status = "Pending",
                CreatedAt = DateTime.UtcNow
            };

            var created = await _svc.CreateAsync(proposal);
            return Ok(created);
        }

        // ================== UPDATE STATUS ==================
        [Authorize(Roles = "User,Admin")]
        [HttpPut("{id}/status/{status}")]
        public async Task<IActionResult> UpdateStatus(string id, string status)
            => Ok(await _svc.UpdateStatusAsync(id, status));

        // ================== DELETE ==================
        [Authorize(Roles = "Admin")]
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
            => Ok(await _svc.DeleteAsync(id));

        [Authorize(Roles = "User,Admin")]
        [HttpPut("{id}/edit")]
        public async Task<IActionResult> Edit(string id, [FromBody] decimal newBid)
        {
            // update giá + xoá message cũ + tạo message mới với giá mới
            var proposal = await _svc.UpdateBidAndRefreshMessageAsync(id, newBid);
            if (proposal is null) return NotFound("Proposal not found.");

            return Ok(new { message = "Proposal updated & message refreshed", proposal });
        }
        [Authorize(Roles = "User,Admin")]
        [HttpPost("{id}/cancel")]
        public async Task<IActionResult> Cancel(string id)
        {
            var updated = await _svc.CancelAndRefreshMessageAsync(id);
            if (updated is null) return NotFound("Proposal not found.");

            return Ok(new { message = "Proposal cancelled & message refreshed", proposal = updated });
        }

        [Authorize(Roles = "User,Admin")]
        [HttpPost("{id}/accept")]
        public async Task<IActionResult> Accept(string id)
        {
            // 0) Lấy user hiện tại từ token (NameIdentifier / sub / userId)
            var currentUserId =
                User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? User.FindFirst("sub")?.Value
                ?? User.FindFirst("userId")?.Value;

            if (string.IsNullOrWhiteSpace(currentUserId) || !ObjectId.TryParse(currentUserId, out _))
                return BadRequest("Invalid current user id.");

            // 1) Lấy proposal
            var proposal = await _svc.GetByIdAsync(id);
            if (proposal == null) return NotFound("Proposal not found.");

            // 2) Đổi trạng thái proposal -> Accepted (đúng chữ)
            await _svc.UpdateStatusAsync(id, "Accepted");
            proposal.Status = "Accepted";

            // 3) Validate các id còn lại
            if (string.IsNullOrWhiteSpace(proposal.ProjectId) || !ObjectId.TryParse(proposal.ProjectId, out _))
                return BadRequest("Invalid ProjectId.");
            if (string.IsNullOrWhiteSpace(proposal.FreelancerId) || !ObjectId.TryParse(proposal.FreelancerId, out _))
                return BadRequest("Invalid FreelancerId.");

            // 4) Tạo contract với ClientId = user hiện tại
            var contract = new Contract
            {
                // nếu repo không tự gen Id string:
                Id = ObjectId.GenerateNewId().ToString(),
                ProjectId = proposal.ProjectId,
                ClientId = currentUserId,            // 👈 chính là người bấm Đồng ý
                FreelancerId = proposal.FreelancerId,
                AgreedAmount = proposal.BidAmount ?? 0,
                Status = "Active",
                CreatedAt = DateTime.UtcNow
            };
            contract = await _contractService.CreateAsync(contract);

            // 5) (không bắt buộc) cập nhật trạng thái project
            try { await _projectService.UpdateStatusAsync(proposal.ProjectId, "InProgress"); } catch { /* log nếu cần */ }

            // 6) Xoá card cũ & tạo message Accepted + nút "Xem hợp đồng"
            object? acceptedMessage = null;
            try { acceptedMessage = await _svc.CreateAcceptedMessageAsync(proposal, contract); } catch { /* log */ }

            // 7) Trả contractId để FE mở popup ngay
            return Ok(new { message = "Proposal accepted", contractId = contract.Id, contract, acceptedMessage });
        }

    }
}
