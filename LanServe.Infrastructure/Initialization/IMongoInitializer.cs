namespace LanServe.Infrastructure.Initialization;
public interface IMongoInitializer
{
    Task InitializeAsync(CancellationToken cancellationToken = default);
}
