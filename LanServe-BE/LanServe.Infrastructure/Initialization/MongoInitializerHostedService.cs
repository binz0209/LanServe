using Microsoft.Extensions.Hosting;

namespace LanServe.Infrastructure.Initialization;

public class MongoInitializerHostedService : IHostedService
{
    private readonly IMongoInitializer _initializer;

    public MongoInitializerHostedService(IMongoInitializer initializer)
    {
        _initializer = initializer;
    }

    public async Task StartAsync(CancellationToken cancellationToken)
    {
        await _initializer.InitializeAsync(cancellationToken);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
