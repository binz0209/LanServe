using System.Security.Claims;
using Microsoft.AspNetCore.Mvc;

namespace LanServe.Api.Helpers;

public static class AdminHelper
{
    /// <summary>
    /// Kiểm tra xem user hiện tại có phải là Admin hay không (case-insensitive)
    /// </summary>
    public static bool IsAdmin(this ClaimsPrincipal user)
    {
        var role = user.FindFirstValue(ClaimTypes.Role);
        if (string.IsNullOrEmpty(role)) return false;
        
        // Check case-insensitive
        return role.Equals("Admin", StringComparison.OrdinalIgnoreCase) ||
               role.Equals("admin", StringComparison.OrdinalIgnoreCase);
    }

    /// <summary>
    /// Kiểm tra xem user có role Admin và trả về Forbid nếu không phải
    /// </summary>
    public static IActionResult? RequireAdmin(this ControllerBase controller)
    {
        if (!controller.User.IsAdmin())
            return controller.Forbid();
        
        return null;
    }
}

