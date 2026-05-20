using CVCreator.Application.Profile.Certifications;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CVCreator.API.Controllers;

[ApiController]
[Route("api/profile/certifications")]
[Authorize]
public class CertificationsController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await sender.Send(new GetCertificationsQuery()));

    [HttpPost]
    public async Task<IActionResult> Create(CreateCertificationRequest request)
    {
        var result = await sender.Send(new CreateCertificationCommand(
            request.NameSv, request.NameEn, request.Year, request.Link));
        return CreatedAtAction(nameof(GetAll), result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, CreateCertificationRequest request)
    {
        var result = await sender.Send(new UpdateCertificationCommand(
            id, request.NameSv, request.NameEn, request.Year, request.Link));
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await sender.Send(new DeleteCertificationCommand(id));
        return deleted ? NoContent() : NotFound();
    }
}

public record CreateCertificationRequest(string? NameSv, string? NameEn, int Year, string? Link = null);
