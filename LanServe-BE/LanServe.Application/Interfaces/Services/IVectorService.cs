namespace LanServe.Application.Interfaces.Services;

public interface IVectorService
{
    /// <summary>
    /// Tính cosine similarity giữa 2 vectors
    /// </summary>
    double CosineSimilarity(List<double> vector1, List<double> vector2);
}

