using System.Net.Http.Headers;
using System.Net.Http.Json;
using CVCreator.Application.Common.Interfaces;
using CVCreator.Infrastructure.Identity;
using CVCreator.Infrastructure.Persistence;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Testcontainers.PostgreSql;

namespace CVCreator.Integration.Tests.Fixtures;

public class IntegrationTestFixture : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder()
        .WithImage("postgres:16-alpine")
        .Build();

    public async Task InitializeAsync()
    {
        await _postgres.StartAsync();
        using var scope = Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<AppDbContext>();
        await db.Database.EnsureCreatedAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.ConfigureAppConfiguration(config =>
        {
            config.AddInMemoryCollection(new Dictionary<string, string?>
            {
                ["Jwt:Secret"] = "cvcreator-dev-secret-key-must-be-at-least-32-chars!",
                ["Jwt:Issuer"] = "CVCreator",
                ["Jwt:Audience"] = "CVCreator",
                ["Jwt:ExpirationMinutes"] = "60",
            });
        });

        builder.ConfigureServices(services =>
        {
            var dbDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(DbContextOptions<AppDbContext>));
            if (dbDescriptor != null) services.Remove(dbDescriptor);
            services.AddDbContext<AppDbContext>(o => o.UseNpgsql(_postgres.GetConnectionString()));

            var storageDescriptor = services.SingleOrDefault(
                d => d.ServiceType == typeof(IFileStorage));
            if (storageDescriptor != null) services.Remove(storageDescriptor);
            services.AddScoped<IFileStorage, FakeFileStorage>();
        });
    }

    public async Task<HttpClient> CreateAuthenticatedClientAsync()
    {
        var client = CreateClient();
        var email = $"{Guid.NewGuid()}@test.com";
        const string password = "Password123!";
        await client.PostAsJsonAsync("/api/auth/register", new { email, password });
        var loginRes = await client.PostAsJsonAsync("/api/auth/login", new { email, password });
        var loginBody = await loginRes.Content.ReadAsStringAsync();
        using var doc = System.Text.Json.JsonDocument.Parse(loginBody);
        var token = doc.RootElement.GetProperty("token").GetString()
            ?? throw new InvalidOperationException("Login returned no token");
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    /// <summary>
    /// Register a fresh user, promote them to the Admin role, then return a client
    /// whose default auth header carries a fresh token reflecting that role.
    /// </summary>
    public async Task<HttpClient> CreateAdminClientAsync()
    {
        var email = $"admin-{Guid.NewGuid()}@test.com";
        const string password = "Password123!";

        var client = CreateClient();
        await client.PostAsJsonAsync("/api/auth/register", new { email, password });

        // Promote to Admin directly via Identity (out-of-band — there's no /admin/promote endpoint)
        using (var scope = Services.CreateScope())
        {
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();
            if (!await roleManager.RoleExistsAsync(AdminSeeder.AdminRole))
                await roleManager.CreateAsync(new IdentityRole(AdminSeeder.AdminRole));
            var user = await userManager.FindByEmailAsync(email)
                ?? throw new InvalidOperationException("Registered user missing");
            await userManager.AddToRoleAsync(user, AdminSeeder.AdminRole);
        }

        // Login AFTER role assignment so the token carries the Admin claim
        var loginRes = await client.PostAsJsonAsync("/api/auth/login", new { email, password });
        var loginBody = await loginRes.Content.ReadAsStringAsync();
        using var doc = System.Text.Json.JsonDocument.Parse(loginBody);
        var token = doc.RootElement.GetProperty("token").GetString()
            ?? throw new InvalidOperationException("Login returned no token");
        client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    public new async Task DisposeAsync() => await _postgres.DisposeAsync();
}
