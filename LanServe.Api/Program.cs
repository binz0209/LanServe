// ===== Usings =====
using LanServe.Application.Interfaces.Repositories;
using LanServe.Application.Interfaces.Services;
using LanServe.Application.Services;             // UserService, v.v.
using LanServe.Infrastructure.Data;
using LanServe.Infrastructure.Initialization;
using LanServe.Infrastructure.Repositories;
using LanServe.Infrastructure.Services;          // JwtTokenService, v.v.
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Security.Claims;
using System.Text;

var builder = WebApplication.CreateBuilder(args);
var services = builder.Services;
var config = builder.Configuration;

Console.WriteLine("==== App starting... ====");
Console.WriteLine($"MongoDb:DbName = {config["MongoDb:DbName"]}");
Console.WriteLine($"MongoDb:ConnectionString = {(string.IsNullOrEmpty(config["MongoDb:ConnectionString"]) ? "NULL" : "FOUND")}");
Console.WriteLine("=========================");

builder.Logging.ClearProviders();
builder.Logging.AddConsole();   // 👈 bắt buộc để log ra stdout/stderr cho az webapp log tail

// ========== Mongo Options + DbContext ==========
services.Configure<MongoOptions>(config.GetSection("MongoDb"));
services.AddSingleton<MongoDbContext>();

// Initializer (tạo DB/collection/index khi app start)
services.AddSingleton<IMongoInitializer, MongoInitializer>();
services.AddHostedService<MongoInitializerHostedService>();

// ========== Controllers ==========
services.AddControllers();

// ========== Swagger ==========
services.AddEndpointsApiExplorer();
services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "LanServe API", Version = "v1" });

    // 👇 DÙNG FULL NAME để tránh trùng (loại bỏ dấu '+'' của nested type)
    c.CustomSchemaIds(t => t.FullName!.Replace('+', '.'));

    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Enter 'Bearer {token}'",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
    };
    c.AddSecurityDefinition("Bearer", securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement { { securityScheme, Array.Empty<string>() } });
});


// ========== CORS (FE Vite) ==========
const string CorsPolicy = "LanServeCors";
services.AddCors(opt =>
{
    opt.AddPolicy(CorsPolicy, p => p
        .WithOrigins(
            "http://localhost:5173",
            "http://127.0.0.1:5173",
            "https://localhost:5173",
            "https://127.0.0.1:5173",
            "https://localhost:5174",
            "https://127.0.0.1:5174",
            "https://lanserve.vercel.app",
            "https://lanserve-b8pdczhsq-binzdapoet0209-7462s-projects.vercel.app",
            "https://lanserve-n9nw1kgam-binzdapoet0209-7462s-projects.vercel.app",
            "https://lanserve-1egppvfb7-binzdapoet0209-7462s-projects.vercel.app",
            "https://lanserve-fe-def2eaaah7cjbbc4.malaysiawest-01.azurewebsites.net"
        // Nếu dùng IPv6 trên Windows:
        // "http://[::1]:5173", "https://[::1]:5173"
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials() // dùng Authorization header vẫn OK
    );
});

// ========== JWT Authentication ==========
var jwtKey = config["Jwt:Key"];
if (!string.IsNullOrWhiteSpace(jwtKey))
{
    services
        .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
        .AddJwtBearer(options =>
        {
            options.RequireHttpsMetadata = false; // dev
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = false,
                ValidateAudience = false,
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey)),
                ValidateLifetime = true,
                RoleClaimType = ClaimTypes.Role
            };
        });
}
services.AddAuthorization();

// ========== Repositories ==========
services.AddScoped<IUserRepository>(sp =>
    new UserRepository(sp.GetRequiredService<MongoDbContext>().Users));
services.AddScoped<IUserProfileRepository>(sp =>
    new UserProfileRepository(sp.GetRequiredService<MongoDbContext>().UserProfiles));
services.AddScoped<ICategoryRepository>(sp =>
    new CategoryRepository(sp.GetRequiredService<MongoDbContext>().Categories));
services.AddScoped<ISkillRepository>(sp =>
    new SkillRepository(sp.GetRequiredService<MongoDbContext>().Skills));
services.AddScoped<IProjectRepository>(sp =>
    new ProjectRepository(sp.GetRequiredService<MongoDbContext>().Projects));
services.AddScoped<IProjectSkillRepository>(sp =>
    new ProjectSkillRepository(sp.GetRequiredService<MongoDbContext>().ProjectSkills));
services.AddScoped<IProposalRepository>(sp =>
    new ProposalRepository(sp.GetRequiredService<MongoDbContext>().Proposals));
services.AddScoped<IContractRepository>(sp =>
    new ContractRepository(sp.GetRequiredService<MongoDbContext>().Contracts));
services.AddScoped<IPaymentRepository>(sp =>
    new PaymentRepository(sp.GetRequiredService<MongoDbContext>().Payments));
services.AddScoped<IMessageRepository>(sp =>
    new MessageRepository(sp.GetRequiredService<MongoDbContext>().Messages));
services.AddScoped<INotificationRepository>(sp =>
    new NotificationRepository(sp.GetRequiredService<MongoDbContext>().Notifications));
services.AddScoped<IReviewRepository>(sp =>
    new ReviewRepository(sp.GetRequiredService<MongoDbContext>().Reviews));
services.AddScoped<IWalletRepository>(sp =>
    new WalletRepository(sp.GetRequiredService<MongoDbContext>().Wallets));
services.AddScoped<IWalletTransactionRepository>(sp =>
    new WalletTransactionRepository(sp.GetRequiredService<MongoDbContext>().WalletTransactions));

// ========== Services (Application) ==========
services.AddScoped<IUserService, UserService>();
services.AddScoped<IUserProfileService, UserProfileService>();
services.AddScoped<ICategoryService, CategoryService>();
services.AddScoped<ISkillService, SkillService>();
services.AddScoped<IProjectService, ProjectService>();
services.AddScoped<IProjectSkillService, ProjectSkillService>();
services.AddScoped<IProposalService, ProposalService>();
services.AddScoped<IContractService, ContractService>();
services.AddScoped<IPaymentService, PaymentService>();
services.AddScoped<IMessageService, MessageService>();
services.AddScoped<INotificationService, NotificationService>();
services.AddScoped<IReviewService, ReviewService>();
services.AddSingleton<IJwtTokenService, JwtTokenService>();
services.AddScoped<IVnPayService, VnPayService>();
builder.Services.AddScoped<IWalletService, WalletService>();

var app = builder.Build();
app.UseExceptionHandler(errorApp =>
{
    errorApp.Run(async context =>
    {
        var ex = context.Features.Get<Microsoft.AspNetCore.Diagnostics.IExceptionHandlerPathFeature>()?.Error;
        // ghi log ra console để xem bằng "az webapp log tail"
        Console.Error.WriteLine($"[ERR] {ex?.GetType().Name}: {ex?.Message}\n{ex?.StackTrace}");

        context.Response.StatusCode = StatusCodes.Status500InternalServerError;
        context.Response.ContentType = "application/problem+json";
        await context.Response.WriteAsJsonAsync(new
        {
            type = "https://httpstatuses.com/500",
            title = "Server Error",
            status = 500,
            detail = ex?.Message,
            traceId = context.TraceIdentifier
        });
    });
});

app.UseExceptionHandler("/__error");
app.Map("/__error", (HttpContext http, ILoggerFactory lf) =>
{
    var ex = http.Features.Get<IExceptionHandlerFeature>()?.Error;

    // Unwrap toàn bộ inner exceptions
    var msgs = new List<string>();
    for (var e = ex; e != null; e = e.InnerException) msgs.Add(e.GetType().FullName + ": " + e.Message);

    lf.CreateLogger("Global").LogError(ex, "Unhandled exception");

    return Results.Problem(
        title: "Server error",
        detail: string.Join(" => ", msgs),  // <<< xem nguyên nhân thật ở đây
        statusCode: StatusCodes.Status500InternalServerError);
});


// ========== Middlewares ==========
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "LanServe API v1");
    c.RoutePrefix = "swagger";
});

app.Lifetime.ApplicationStarted.Register(() =>
{
    var urls = app.Urls; // IUrlCollection
    Console.WriteLine("==== LanServe API is running on: ====");
    foreach (var url in urls)
    {
        Console.WriteLine(url);
    }
    Console.WriteLine("=====================================");
});

app.UseHttpsRedirection();
app.UseCors(CorsPolicy);

if (!string.IsNullOrWhiteSpace(jwtKey))
{
    app.UseAuthentication();
}
app.UseAuthorization();

app.MapControllers();

app.Run();