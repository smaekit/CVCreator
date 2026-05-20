using CVCreator.Application.Profile.Languages;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CVCreator.API.Controllers;

[ApiController]
[Route("api/profile/languages")]
[Authorize]
public class LanguagesController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await sender.Send(new GetLanguagesQuery()));

    [HttpPost]
    public async Task<IActionResult> Create(CreateLanguageRequest request)
    {
        var result = await sender.Send(new CreateLanguageCommand(request.Name, request.Proficiency));
        return CreatedAtAction(nameof(GetAll), result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, CreateLanguageRequest request)
    {
        var result = await sender.Send(new UpdateLanguageCommand(id, request.Name, request.Proficiency));
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await sender.Send(new DeleteLanguageCommand(id));
        return deleted ? NoContent() : NotFound();
    }
}

public record CreateLanguageRequest(string Name, string Proficiency);
