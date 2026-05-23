using CVCreator.Application.Common.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace CVCreator.Infrastructure.Identity;

public class IdentityService(
    UserManager<ApplicationUser> userManager,
    IJwtService jwtService) : IIdentityService
{
    public async Task<(bool Success, string[] Errors)> RegisterAsync(string email, string password)
    {
        var user = new ApplicationUser { UserName = email, Email = email, CreatedAt = DateTime.UtcNow };
        var result = await userManager.CreateAsync(user, password);
        return result.Succeeded
            ? (true, [])
            : (false, result.Errors.Select(e => e.Description).ToArray());
    }

    public async Task<string?> LoginAsync(string email, string password)
    {
        var user = await userManager.FindByEmailAsync(email);
        if (user is null) return null;

        var valid = await userManager.CheckPasswordAsync(user, password);
        if (!valid) return null;

        var roles = await userManager.GetRolesAsync(user);
        return jwtService.GenerateToken(user.Id, user.Email!, roles);
    }
}
