using LanServe.Api.Hubs;
using LanServe.Application.Interfaces.Services;
using LanServe.Domain.Entities;
using Microsoft.AspNetCore.SignalR;
using System.Text.Json;

namespace LanServe.Api.Services
{
    public class SignalRRealtimeService : IRealtimeService
    {
        private readonly IHubContext<NotificationHub> _hubContext;

        public SignalRRealtimeService(IHubContext<NotificationHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendToUserAsync(string userId, Notification notification)
        {
            if (string.IsNullOrEmpty(userId))
            {
                Console.WriteLine("⚠️ SignalR SendToUserAsync: userId is null or empty — skip sending");
                return;
            }

            if (notification == null)
            {
                Console.WriteLine($"⚠️ SignalR SendToUserAsync: notification is null for user {userId}");
                return;
            }

            try
            {
                Console.WriteLine($"📡 Sending SignalR notification to {userId}: {JsonSerializer.Serialize(notification)}");

                await _hubContext.Clients.User(userId)
                    .SendAsync("ReceiveNotification", notification);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ SignalR SendToUserAsync failed for {userId}: {ex.Message}");
            }
        }
    }
}
