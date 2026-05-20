using CVCreator.Application.Common.Interfaces;
using CVCreator.Application.Profile.Queries.GetProfile;
using MediatR;
using ProfileEntity = CVCreator.Domain.Entities.Profile;
using Microsoft.EntityFrameworkCore;

namespace CVCreator.Application.Profile.Commands.UpsertProfile;

public record UpsertProfileCommand(string FirstName, string LastName, string? IntroductionSv = null, string? IntroductionEn = null) : IRequest<ProfileDto>;

public class UpsertProfileCommandHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<UpsertProfileCommand, ProfileDto>
{
    public async Task<ProfileDto> Handle(UpsertProfileCommand request, CancellationToken ct)
    {
        var userId = currentUser.UserId!;
        var profile = await db.Profiles.FirstOrDefaultAsync(p => p.UserId == userId, ct);

        if (profile is null)
        {
            profile = new ProfileEntity { UserId = userId };
            db.Profiles.Add(profile);
        }

        profile.FirstName = request.FirstName;
        profile.LastName = request.LastName;
        if (request.IntroductionSv is not null) profile.IntroductionSv = request.IntroductionSv;
        if (request.IntroductionEn is not null) profile.IntroductionEn = request.IntroductionEn;
        await db.SaveChangesAsync(ct);

        return new ProfileDto(profile.FirstName, profile.LastName, profile.PictureUrl, profile.IntroductionSv, profile.IntroductionEn);
    }
}
