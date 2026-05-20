using CVCreator.Application.Profile.Assignments;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CVCreator.API.Controllers;

[ApiController]
[Route("api/profile/assignments")]
[Authorize]
public class AssignmentsController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await sender.Send(new GetAssignmentsQuery()));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOne(Guid id)
    {
        var result = await sender.Send(new GetAssignmentQuery(id));
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(AssignmentRequest request)
    {
        var result = await sender.Send(new CreateAssignmentCommand(
            request.TitleSv, request.TitleEn,
            request.DescriptionSv, request.DescriptionEn,
            request.Client, request.StartDate, request.EndDate));
        return CreatedAtAction(nameof(GetOne), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<IActionResult> Update(Guid id, AssignmentRequest request)
    {
        var result = await sender.Send(new UpdateAssignmentCommand(
            id, request.TitleSv, request.TitleEn,
            request.DescriptionSv, request.DescriptionEn,
            request.Client, request.StartDate, request.EndDate));
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await sender.Send(new DeleteAssignmentCommand(id));
        return deleted ? NoContent() : NotFound();
    }

    [HttpPost("{id:guid}/skills/{skillId:guid}")]
    public async Task<IActionResult> AttachSkill(Guid id, Guid skillId)
    {
        var ok = await sender.Send(new AttachSkillCommand(id, skillId));
        return ok ? NoContent() : NotFound();
    }

    [HttpDelete("{id:guid}/skills/{skillId:guid}")]
    public async Task<IActionResult> DetachSkill(Guid id, Guid skillId)
    {
        var ok = await sender.Send(new DetachSkillCommand(id, skillId));
        return ok ? NoContent() : NotFound();
    }
}

public record AssignmentRequest(
    string? TitleSv, string? TitleEn,
    string? DescriptionSv, string? DescriptionEn,
    string Client, string StartDate, string? EndDate = null);
