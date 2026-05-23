using CVCreator.Application.Admin.GetAdminStats;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace CVCreator.API.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Roles = "Admin")]
public class AdminController(ISender sender) : ControllerBase
{
    [HttpGet("stats")]
    public async Task<ActionResult<AdminStatsDto>> GetStats([FromQuery] int days = 30, CancellationToken ct = default)
    {
        var stats = await sender.Send(new GetAdminStatsQuery(days), ct);
        return Ok(stats);
    }
}
