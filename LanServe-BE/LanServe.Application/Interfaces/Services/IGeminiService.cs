namespace LanServe.Application.Interfaces.Services;

public interface IGeminiService
{
    /// <summary>
    /// Extract skills từ text (bio, description, etc.) sử dụng Gemini
    /// </summary>
    Task<List<string>> ExtractSkillsAsync(string text);

    /// <summary>
    /// Generate embedding vector từ list of skills sử dụng Gemini
    /// </summary>
    Task<List<double>> GenerateEmbeddingAsync(List<string> skills);
}

