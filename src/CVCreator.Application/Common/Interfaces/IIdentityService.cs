namespace CVCreator.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<(bool Success, string[] Errors)> RegisterAsync(string email, string password);
    Task<string?> LoginAsync(string email, string password);
}
