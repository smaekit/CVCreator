using Microsoft.AspNetCore.Identity;

namespace CVCreator.Infrastructure.Identity;

public class ApplicationUser : IdentityUser
{
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
