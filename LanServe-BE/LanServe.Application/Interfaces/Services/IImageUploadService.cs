namespace LanServe.Application.Interfaces.Services;

public interface IImageUploadService
{
    Task<string> UploadImageAsync(Stream imageStream, string fileName, string folder = "lanserve");
    Task<bool> DeleteImageAsync(string publicId);
}


