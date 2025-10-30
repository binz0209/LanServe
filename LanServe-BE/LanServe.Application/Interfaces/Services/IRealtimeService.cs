using LanServe.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LanServe.Application.Interfaces.Services
{
    public interface IRealtimeService
    {
        Task SendToUserAsync(string userId, Notification notification);
    }
}
