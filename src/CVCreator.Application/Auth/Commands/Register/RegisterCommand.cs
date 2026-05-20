using CVCreator.Application.Common.Interfaces;
using MediatR;

namespace CVCreator.Application.Auth.Commands.Register;

public record RegisterCommand(string Email, string Password) : IRequest<RegisterResult>;
public record RegisterResult(bool Success, string[] Errors);

public class RegisterCommandHandler(IIdentityService identityService)
    : IRequestHandler<RegisterCommand, RegisterResult>
{
    public async Task<RegisterResult> Handle(RegisterCommand request, CancellationToken ct)
    {
        var (success, errors) = await identityService.RegisterAsync(request.Email, request.Password);
        return new RegisterResult(success, errors);
    }
}
