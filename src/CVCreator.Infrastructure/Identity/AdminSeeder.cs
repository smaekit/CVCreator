using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace CVCreator.Infrastructure.Identity;

public static class AdminSeeder
{
    public const string AdminRole = "Admin";

    /// <summary>
    /// Idempotently ensure the Admin role exists, the configured admin user exists,
    /// and the user is assigned the Admin role. Safe to invoke on every app startup.
    /// </summary>
    public static async Task SeedAsync(IServiceProvider services)
    {
        var config = services.GetRequiredService<IConfiguration>();
        var email = config["Admin:Email"];
        var password = config["Admin:Password"];

        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(password))
            return; // No admin configured — leave the system without one rather than guess

        var roleManager = services.GetRequiredService<RoleManager<IdentityRole>>();
        var userManager = services.GetRequiredService<UserManager<ApplicationUser>>();

        if (!await roleManager.RoleExistsAsync(AdminRole))
            await roleManager.CreateAsync(new IdentityRole(AdminRole));

        var user = await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new ApplicationUser { UserName = email, Email = email, EmailConfirmed = true };
            var create = await userManager.CreateAsync(user, password);
            if (!create.Succeeded) return; // Silent: bad password complexity or DB error — caller checks logs
        }

        if (!await userManager.IsInRoleAsync(user, AdminRole))
            await userManager.AddToRoleAsync(user, AdminRole);
    }
}
