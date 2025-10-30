using LanServe.Api.Hubs;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;
using Microsoft.AspNetCore.SignalR;

namespace LanServe.Api.Services
{
    public class RealtimeService : IRealtimeService
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public RealtimeService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendToUserAsync(string userId, Notification notification)
        {
            if (string.IsNullOrWhiteSpace(userId))
            {
                Console.WriteLine("⚠️ [RealtimeService] Invalid userId");
                return;
            }

            try
            {
                await _hubContext.Clients.User(userId)
                    .SendAsync("ReceiveNotification", notification);

                Console.WriteLine($"📡 [RealtimeService] Sent to userId={userId}, type={notification.Type}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ [RealtimeService] Error sending to {userId}: {ex.Message}");
            }
        }
    }
}
