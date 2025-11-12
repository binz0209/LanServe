using System.Net;
using System.Net.Mail;

namespace LanServe.Infrastructure.Services
{
    public class EmailService
    {
        private readonly string _smtpHost;
        private readonly int _smtpPort;
        private readonly string _fromEmail;
        private readonly string _fromName;
        private readonly string _password;

        public EmailService(string smtpHost, int smtpPort, string fromEmail, string fromName, string password)
        {
            _smtpHost = smtpHost;
            _smtpPort = smtpPort;
            _fromEmail = fromEmail;
            _fromName = fromName;
            _password = password;
        }

        public async Task SendEmailAsync(string toEmail, string subject, string body, bool isHtml = true)
        {
            try
            {
                using var smtp = new SmtpClient(_smtpHost)
                {
                    Port = _smtpPort,
                    Credentials = new NetworkCredential(_fromEmail, _password),
                    EnableSsl = true
                };

                var msg = new MailMessage(_fromEmail, toEmail)
                {
                    Subject = subject,
                    Body = body,
                    IsBodyHtml = isHtml
                };

                await smtp.SendMailAsync(msg);
                Console.WriteLine($"📧 Email sent to {toEmail}: {subject}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Failed to send email to {toEmail}: {ex.Message}");
                throw;
            }
        }
    }
}
