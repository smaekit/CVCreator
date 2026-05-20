using CVCreator.Application.Common.Interfaces;
using MediatR;

namespace CVCreator.Application.Auth.Commands.Login;

public record LoginCommand(string Email, string Password) : IRequest<string?>;

public class LoginCommandHandler(IIdentityService identityService)
    : IRequestHandler<LoginCommand, string?>
{
    public async Task<string?> Handle(LoginCommand request, CancellationToken ct)
        => await identityService.LoginAsync(request.Email, request.Password);
}
