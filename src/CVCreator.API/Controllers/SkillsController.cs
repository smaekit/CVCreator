using CVCreator.Application.Profile.Skills;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CVCreator.API.Controllers;

[ApiController]
[Route("api/profile/skills")]
[Authorize]
public class SkillsController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await sender.Send(new GetSkillsQuery()));

    [HttpPost]
    public async Task<IActionResult> Create(CreateSkillRequest request)
    {
        var result = await sender.Send(new CreateSkillCommand(request.Name, request.Category));
        return CreatedAtAction(nameof(GetAll), result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, UpdateSkillRequest request)
    {
        var result = await sender.Send(new UpdateSkillCommand(id, request.Name, request.Category));
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await sender.Send(new DeleteSkillCommand(id));
        return deleted ? NoContent() : NotFound();
    }
}

public record CreateSkillRequest(string Name, string? Category = null);
public record UpdateSkillRequest(string Name, string? Category = null);
