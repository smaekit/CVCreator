using CVCreator.Application.Auth.Commands.Login;
using CVCreator.Application.Auth.Commands.Register;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace CVCreator.API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(ISender sender) : ControllerBase
{
    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var result = await sender.Send(new RegisterCommand(request.Email, request.Password));
        if (!result.Success)
            return BadRequest(new { errors = result.Errors });
        return Ok();
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var token = await sender.Send(new LoginCommand(request.Email, request.Password));
        if (token is null)
            return Unauthorized();
        return Ok(new { token });
    }
}

public record RegisterRequest(string Email, string Password);
public record LoginRequest(string Email, string Password);
