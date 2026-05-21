using CVCreator.Application.CVs;
using CVCreator.Application.Common.Interfaces;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CVCreator.API.Controllers;

[ApiController]
[Route("api/cvs")]
[Authorize]
public class CVsController(ISender sender, IPreviewTokenService previewTokenService) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> GetAll()
        => Ok(await sender.Send(new GetCvsQuery()));

    [HttpGet("{id:guid}")]
    public async Task<IActionResult> GetOne(Guid id)
    {
        var result = await sender.Send(new GetCvQuery(id));
        return result is null ? NotFound() : Ok(result);
    }

    [HttpGet("{id:guid}/preview")]
    [AllowAnonymous]
    public async Task<IActionResult> GetPreview(Guid id, [FromQuery] string token)
    {
        if (!previewTokenService.Validate(token, out var cvId) || cvId != id)
            return Unauthorized();
        var result = await sender.Send(new GetCvForPreviewQuery(id));
        return result is null ? NotFound() : Ok(result);
    }

    [HttpPost]
    public async Task<IActionResult> Create(CreateCvRequest request)
    {
        var result = await sender.Send(new CreateCvCommand(request.Company, request.Language));
        return CreatedAtAction(nameof(GetOne), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}/selections")]
    public async Task<IActionResult> UpdateSelections(Guid id, UpdateSelectionsRequest request)
    {
        var ok = await sender.Send(new UpdateCvSelectionsCommand(
            id,
            request.Assignments.Select(a => new SelectionItem(a.Id, a.DisplayOrder, a.IsHighlighted, a.DescriptionOverride)).ToList(),
            request.Skills.Select(s => new SelectionItem(s.Id, s.DisplayOrder)).ToList(),
            request.Educations.Select(e => new SelectionItem(e.Id, e.DisplayOrder)).ToList(),
            request.Certifications.Select(c => new SelectionItem(c.Id, c.DisplayOrder)).ToList(),
            request.Languages.Select(l => new SelectionItem(l.Id, l.DisplayOrder)).ToList()));
        return ok ? NoContent() : NotFound();
    }

    [HttpPut("{id:guid}/overrides")]
    public async Task<IActionResult> UpdateOverrides(Guid id, UpdateOverridesRequest request)
    {
        var ok = await sender.Send(new UpdateCvOverridesCommand(id, request.IntroductionOverride, request.YearsOfExperience));
        return ok ? NoContent() : NotFound();
    }

    [HttpPost("{id:guid}/pdf")]
    public async Task<IActionResult> GeneratePdf(Guid id, [FromQuery] string? theme = null)
    {
        var result = await sender.Send(new GeneratePdfCommand(id, theme));
        if (result is null) return NotFound();
        return File(result.Bytes, "application/pdf",
            System.Net.Http.Headers.ContentDispositionHeaderValue.Parse(
                $"attachment; filename=\"{result.FileName}\"").FileName);
    }

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id)
    {
        var deleted = await sender.Send(new DeleteCvCommand(id));
        return deleted ? NoContent() : NotFound();
    }
}

public record CreateCvRequest(string Company, string Language);
public record UpdateOverridesRequest(string? IntroductionOverride, string? YearsOfExperience);

public record SelectionItemRequest(Guid Id, int DisplayOrder, bool IsHighlighted = false, string? DescriptionOverride = null);

public record UpdateSelectionsRequest(
    List<SelectionItemRequest> Assignments,
    List<SelectionItemRequest> Skills,
    List<SelectionItemRequest> Educations,
    List<SelectionItemRequest> Certifications,
    List<SelectionItemRequest> Languages);
