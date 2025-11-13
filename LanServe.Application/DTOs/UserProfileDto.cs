using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace LanServe.Application.DTOs
{
    public class UserProfileDto
    {
        public string Id { get; set; } = null!;
        public string UserId { get; set; } = null!;
        public string Title { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string? Location { get; set; }
        public decimal? HourlyRate { get; set; }
        public List<string> Languages { get; set; } = new();
        public List<string> Certifications { get; set; } = new();
        public List<string> Skills { get; set; } = new();
    }
}
