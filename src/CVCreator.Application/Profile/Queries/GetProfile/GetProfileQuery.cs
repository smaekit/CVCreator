using CVCreator.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CVCreator.Application.Profile.Queries.GetProfile;

public record GetProfileQuery : IRequest<ProfileDto?>;

public record ProfileDto(string FirstName, string LastName, string? PictureUrl, string? IntroductionSv, string? IntroductionEn);

public class GetProfileQueryHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetProfileQuery, ProfileDto?>
{
    public async Task<ProfileDto?> Handle(GetProfileQuery request, CancellationToken ct)
    {
        var profile = await db.Profiles
            .FirstOrDefaultAsync(p => p.UserId == currentUser.UserId, ct);
        return profile is null
            ? null
            : new ProfileDto(profile.FirstName, profile.LastName, profile.PictureUrl, profile.IntroductionSv, profile.IntroductionEn);
    }
}
