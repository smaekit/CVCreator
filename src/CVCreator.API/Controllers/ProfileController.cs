using CVCreator.Application.Profile.Commands.UploadProfilePicture;
using CVCreator.Application.Profile.Commands.UpsertProfile;
using CVCreator.Application.Profile.Queries.GetProfile;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CVCreator.API.Controllers;

[ApiController]
[Route("api/profile")]
[Authorize]
public class ProfileController(ISender sender) : ControllerBase
{
    [HttpGet]
    public async Task<IActionResult> Get()
    {
        var profile = await sender.Send(new GetProfileQuery());
        return profile is null ? NotFound() : Ok(profile);
    }

    [HttpPut]
    public async Task<IActionResult> Upsert(UpsertProfileRequest request)
    {
        var result = await sender.Send(new UpsertProfileCommand(request.FirstName, request.LastName, request.IntroductionSv, request.IntroductionEn));
        return Ok(result);
    }

    [HttpPost("picture")]
    public async Task<IActionResult> UploadPicture(IFormFile file)
    {
        if (file.Length == 0) return BadRequest();
        var ext = Path.GetExtension(file.FileName);
        await using var stream = file.OpenReadStream();
        var url = await sender.Send(new UploadProfilePictureCommand(stream, file.ContentType, ext));
        return Ok(new { url });
    }
}

public record UpsertProfileRequest(string FirstName, string LastName, string? IntroductionSv = null, string? IntroductionEn = null);
