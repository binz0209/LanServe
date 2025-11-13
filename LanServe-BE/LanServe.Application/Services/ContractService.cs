using LanServe.Application.Interfaces.Repositories;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;

namespace LanServe.Application.Services;

public class ContractService : IContractService
{
    private readonly IContractRepository _repo;
    private readonly IWalletService _walletService;
    private readonly IWalletTransactionRepository _walletTxns;
    private readonly INotificationService _notificationService;
    private readonly IProjectService _projectService;

    public ContractService(
        IContractRepository repo,
        IWalletService walletService,
        IWalletTransactionRepository walletTxns,
        INotificationService notificationService,
        IProjectService projectService)
    {
        _repo = repo;
        _walletService = walletService;
        _walletTxns = walletTxns;
        _notificationService = notificationService;
        _projectService = projectService;
    }

    public Task<Contract?> GetByIdAsync(string id)
        => _repo.GetByIdAsync(id);

    public Task<IEnumerable<Contract>> GetByClientIdAsync(string clientId)
        => _repo.GetByClientIdAsync(clientId);

    public Task<IEnumerable<Contract>> GetByFreelancerIdAsync(string freelancerId)
        => _repo.GetByFreelancerIdAsync(freelancerId);

    public Task<IEnumerable<Contract>> GetAllAsync()
        => _repo.GetAllAsync();

    public Task<Contract> CreateAsync(Contract entity)
        => _repo.InsertAsync(entity);

    public async Task<bool> UpdateAsync(string id, Contract entity)
    {
        entity.Id = id;
        return await _repo.UpdateAsync(entity);
    }

    public Task<bool> DeleteAsync(string id)
        => _repo.DeleteAsync(id);

    public async Task<(bool Success, string Message)> CompleteContractAsync(string contractId, string userId)
    {
        // 1️⃣ Lấy contract
        var contract = await _repo.GetByIdAsync(contractId);
        if (contract == null)
            return (false, "Contract not found");

        // 2️⃣ Kiểm tra quyền: chỉ chủ project (client) mới được xác nhận
        if (contract.ClientId != userId)
            return (false, "Only project owner can complete the contract");

        // 3️⃣ Kiểm tra status: chỉ contract Active mới được complete
        if (contract.Status != "Active")
            return (false, $"Contract is already {contract.Status}");

        // 4️⃣ Lấy amount từ contract
        var amount = (long)Math.Round(contract.AgreedAmount, MidpointRounding.AwayFromZero);

        // 5️⃣ Cộng tiền vào wallet của freelancer (tiền đã được trừ khi accept proposal)
        // Không cần trừ lại vì đã trừ khi accept proposal rồi
        var depositResult = await _walletService.ChangeBalanceAsync(
            contract.FreelancerId,
            amount,
            $"Payment received for completed contract #{contractId}");

        if (!depositResult.Succeeded)
            return (false, $"Failed to deposit to freelancer wallet: {string.Join(", ", depositResult.Errors)}");

        // 7️⃣ Lấy lại wallet sau khi cộng tiền để có balance chính xác
        var freelancerWallet = depositResult.Wallet ?? await _walletService.GetByUserIdAsync(contract.FreelancerId);
        if (freelancerWallet == null)
            return (false, "Failed to retrieve freelancer wallet after deposit");

        // 8️⃣ Tạo WalletTransaction cho freelancer (deposit)
        await _walletTxns.InsertAsync(new WalletTransaction
        {
            WalletId = freelancerWallet.Id,
            UserId = contract.FreelancerId,
            Type = "Deposit",
            Amount = amount,
            BalanceAfter = freelancerWallet.Balance,
            Note = $"Payment received for completed contract #{contractId}",
            CreatedAt = DateTime.UtcNow
        }, CancellationToken.None);

        // 9️⃣ Cập nhật contract status thành Completed
        // Đảm bảo Id được set trước khi update
        contract.Id = contractId;
        contract.Status = "Completed";
        var updateResult = await _repo.UpdateAsync(contract);
        if (!updateResult)
            return (false, "Failed to update contract status");

        // 🔟 Cập nhật project status thành Completed
        await _projectService.UpdateStatusAsync(contract.ProjectId, "Completed");

        // 1️⃣1️⃣ Tạo notification cho client (chủ project) để review freelancer
        await _notificationService.CreateAsync(new Notification
        {
            UserId = contract.ClientId,
            Type = "ContractCompleted",
            Title = "Dự án đã hoàn thành",
            Message = $"Dự án đã được xác nhận hoàn thành. Vui lòng đánh giá freelancer.",
            Payload = System.Text.Json.JsonSerializer.Serialize(new
            {
                ContractId = contractId,
                ProjectId = contract.ProjectId,
                FreelancerId = contract.FreelancerId,
                Action = "review_freelancer"
            }),
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        });

        // 1️⃣2️⃣ Tạo notification cho freelancer để review client
        await _notificationService.CreateAsync(new Notification
        {
            UserId = contract.FreelancerId,
            Type = "ContractCompleted",
            Title = "Dự án đã hoàn thành",
            Message = $"Dự án đã được chủ project xác nhận hoàn thành. Bạn đã nhận được thanh toán. Vui lòng đánh giá chủ project.",
            Payload = System.Text.Json.JsonSerializer.Serialize(new
            {
                ContractId = contractId,
                ProjectId = contract.ProjectId,
                ClientId = contract.ClientId,
                Action = "review_client"
            }),
            IsRead = false,
            CreatedAt = DateTime.UtcNow
        });

        return (true, "Contract completed successfully. Payment processed and notifications sent.");
    }
}
