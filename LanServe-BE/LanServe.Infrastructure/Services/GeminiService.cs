using LanServe.Application.Interfaces.Services;
using Microsoft.Extensions.Configuration;
using System.Text;
using System.Text.Json;

namespace LanServe.Infrastructure.Services;

public class GeminiService : IGeminiService
{
    private readonly string _apiKey;
    private readonly HttpClient _httpClient;

    public GeminiService(IConfiguration configuration, HttpClient httpClient)
    {
        _apiKey = configuration["Gemini:ApiKey"] ?? throw new InvalidOperationException("Gemini:ApiKey not configured");
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri("https://generativelanguage.googleapis.com/v1beta/");
    }

    public async Task<List<string>> ExtractSkillsAsync(string text)
    {
        if (string.IsNullOrWhiteSpace(text))
            return new List<string>();

        try
        {
            var prompt = $@"Phân tích đoạn text sau và trích xuất các kỹ năng (skills) liên quan đến công nghệ, lập trình, thiết kế, marketing, v.v.
Chỉ trả về danh sách các skills, mỗi skill trên một dòng, không có số thứ tự, không có giải thích.

Text:
{text}

Trả về chỉ danh sách skills, mỗi skill một dòng:";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"models/gemini-1.5-flash:generateContent?key={_apiKey}", content);
            response.EnsureSuccessStatusCode();

            var responseJson = await response.Content.ReadAsStringAsync();
            var responseObj = JsonSerializer.Deserialize<JsonElement>(responseJson);

            var result = responseObj
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString() ?? "";

            // Parse skills từ response
            var skills = result
                .Split('\n', StringSplitOptions.RemoveEmptyEntries)
                .Select(s => s.Trim())
                .Where(s => !string.IsNullOrWhiteSpace(s))
                .Where(s => !s.StartsWith("#") && !s.StartsWith("-") && !s.StartsWith("*"))
                .Select(s => s.TrimStart('-', '*', ' ', '#').Trim())
                .Where(s => s.Length > 0)
                .Distinct()
                .ToList();

            return skills;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error extracting skills: {ex.Message}");
            return new List<string>();
        }
    }

    public async Task<List<double>> GenerateEmbeddingAsync(List<string> skills)
    {
        if (skills == null || skills.Count == 0)
            return new List<double>(new double[768]);

        try
        {
            // Combine skills thành một text
            var skillsText = string.Join(", ", skills);

            var prompt = $@"Tạo embedding vector cho các kỹ năng sau. 
Trả về một mảng JSON chứa 768 số thực (double) đại diện cho vector embedding.

Skills: {skillsText}

Trả về chỉ mảng JSON với 768 phần tử, ví dụ: [0.1, 0.2, 0.3, ...]";

            var requestBody = new
            {
                contents = new[]
                {
                    new
                    {
                        parts = new[]
                        {
                            new { text = prompt }
                        }
                    }
                }
            };

            var json = JsonSerializer.Serialize(requestBody);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync($"models/gemini-1.5-flash:generateContent?key={_apiKey}", content);
            response.EnsureSuccessStatusCode();

            var responseJson = await response.Content.ReadAsStringAsync();
            var responseObj = JsonSerializer.Deserialize<JsonElement>(responseJson);

            var result = responseObj
                .GetProperty("candidates")[0]
                .GetProperty("content")
                .GetProperty("parts")[0]
                .GetProperty("text")
                .GetString() ?? "";

            // Parse JSON array
            // Loại bỏ markdown code blocks nếu có
            if (result.StartsWith("```"))
            {
                var lines = result.Split('\n');
                result = string.Join("\n", lines.Skip(1).Take(lines.Length - 2));
            }

            result = result.Trim();

            // Parse JSON
            var embedding = JsonSerializer.Deserialize<List<double>>(result);
            
            if (embedding == null || embedding.Count == 0)
            {
                // Fallback: tạo embedding giả (zero vector)
                return new List<double>(new double[768]);
            }

            // Normalize về 768 dimensions nếu cần
            if (embedding.Count < 768)
            {
                var normalized = new List<double>(embedding);
                while (normalized.Count < 768)
                {
                    normalized.Add(0.0);
                }
                return normalized;
            }
            else if (embedding.Count > 768)
            {
                return embedding.Take(768).ToList();
            }

            return embedding;
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Error generating embedding: {ex.Message}");
            // Fallback: return zero vector
            return new List<double>(new double[768]);
        }
    }
}
