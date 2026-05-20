using CVCreator.Application.CVs;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CVCreator.API.Controllers;

[ApiController]
[Route("api/cvs/{cvId:guid}/front-page-groups")]
[Authorize]
public class FrontPageGroupsController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll(Guid cvId)
        => Ok(await sender.Send(new GetFrontPageGroupsQuery(cvId)));

    [HttpPost]
    public async Task<IActionResult> Create(Guid cvId, CreateGroupRequest request)
    {
        var result = await sender.Send(new CreateFrontPageGroupCommand(cvId, request.HeaderSv, request.HeaderEn, request.DisplayOrder));
        return result is null ? NotFound() : CreatedAtAction(nameof(GetAll), new { cvId }, result);
    }

    [HttpPut("{groupId:guid}")]
    public async Task<IActionResult> Update(Guid cvId, Guid groupId, UpdateGroupRequest request)
    {
        var result = await sender.Send(new UpdateFrontPageGroupCommand(
            cvId, groupId, request.HeaderSv, request.HeaderEn, request.DisplayOrder,
            request.Items.Select(i => new FrontPageGroupItemRequest(i.SkillId, i.CertificationId, i.DisplayOrder)).ToList()));
        return result is null ? NotFound() : Ok(result);
    }

    [HttpDelete("{groupId:guid}")]
    public async Task<IActionResult> Delete(Guid cvId, Guid groupId)
    {
        var deleted = await sender.Send(new DeleteFrontPageGroupCommand(cvId, groupId));
        return deleted ? NoContent() : NotFound();
    }
}

public record CreateGroupRequest(string? HeaderSv, string? HeaderEn, int DisplayOrder = 0);
public record UpdateGroupRequest(string? HeaderSv, string? HeaderEn, int DisplayOrder, List<GroupItemRequest> Items);
public record GroupItemRequest(Guid? SkillId, Guid? CertificationId, int DisplayOrder);
