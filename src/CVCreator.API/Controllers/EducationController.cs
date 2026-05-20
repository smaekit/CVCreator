using CVCreator.Application.Profile.Education;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CVCreator.API.Controllers;

[ApiController]
[Route("api/profile/education")]
[Authorize]
public class EducationController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await sender.Send(new GetEducationsQuery()));

    [HttpPost]
    public async Task<IActionResult> Create(CreateEducationRequest request)
    {
        var result = await sender.Send(new CreateEducationCommand(
            request.DegreeSv, request.DegreeEn, request.School, request.StartYear, request.EndYear));
        return CreatedAtAction(nameof(GetAll), result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, CreateEducationRequest request)
    {
        var result = await sender.Send(new UpdateEducationCommand(
            id, request.DegreeSv, request.DegreeEn, request.School, request.StartYear, request.EndYear));
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await sender.Send(new DeleteEducationCommand(id));
        return deleted ? NoContent() : NotFound();
    }
}

public record CreateEducationRequest(string? DegreeSv, string? DegreeEn, string School, int StartYear, int? EndYear = null);
