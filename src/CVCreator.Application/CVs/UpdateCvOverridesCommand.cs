using CVCreator.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CVCreator.Application.CVs;

public record UpdateCvOverridesCommand(
    Guid CvId,
    string? IntroductionOverride,
    string? YearsOfExperience) : IRequest<bool>;

public class UpdateCvOverridesHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<UpdateCvOverridesCommand, bool>
{
    public async Task<bool> Handle(UpdateCvOverridesCommand req, CancellationToken ct)
    {
        var cv = await db.CVs.FirstOrDefaultAsync(c => c.Id == req.CvId && c.UserId == currentUser.UserId, ct);
        if (cv is null) return false;

        cv.IntroductionOverride = req.IntroductionOverride;
        cv.YearsOfExperience = req.YearsOfExperience;
        await db.SaveChangesAsync(ct);
        return true;
    }
}
