using CVCreator.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CVCreator.API.Controllers;

[ApiController]
[Route("api/ai")]
[Authorize]
public class AiController(IAiTextService aiTextService) : ControllerBase
{
    [HttpPost("improve")]
    public async IAsyncEnumerable<string> Improve(
        [FromBody] AiTextRequest request,
        [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct = default)
    {
        await foreach (var chunk in aiTextService.StreamImprove(request.Text, request.Language, ct))
            yield return chunk;
    }

    [HttpPost("translate")]
    public async IAsyncEnumerable<string> Translate(
        [FromBody] AiTextRequest request,
        [System.Runtime.CompilerServices.EnumeratorCancellation] CancellationToken ct = default)
    {
        await foreach (var chunk in aiTextService.StreamTranslate(request.Text, request.Language, ct))
            yield return chunk;
    }
}

public record AiTextRequest(string Text, string Language);
