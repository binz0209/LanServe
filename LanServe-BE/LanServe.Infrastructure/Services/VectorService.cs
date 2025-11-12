using LanServe.Application.Interfaces.Services;

namespace LanServe.Infrastructure.Services;

public class VectorService : IVectorService
{
    public double CosineSimilarity(List<double> vector1, List<double> vector2)
    {
        if (vector1 == null || vector2 == null)
            return 0.0;

        if (vector1.Count != vector2.Count)
            return 0.0;

        if (vector1.Count == 0)
            return 0.0;

        // Tính dot product
        double dotProduct = 0.0;
        for (int i = 0; i < vector1.Count; i++)
        {
            dotProduct += vector1[i] * vector2[i];
        }

        // Tính magnitude của vector1
        double magnitude1 = 0.0;
        for (int i = 0; i < vector1.Count; i++)
        {
            magnitude1 += vector1[i] * vector1[i];
        }
        magnitude1 = Math.Sqrt(magnitude1);

        // Tính magnitude của vector2
        double magnitude2 = 0.0;
        for (int i = 0; i < vector2.Count; i++)
        {
            magnitude2 += vector2[i] * vector2[i];
        }
        magnitude2 = Math.Sqrt(magnitude2);

        // Cosine similarity = dot product / (magnitude1 * magnitude2)
        if (magnitude1 == 0.0 || magnitude2 == 0.0)
            return 0.0;

        return dotProduct / (magnitude1 * magnitude2);
    }
}

