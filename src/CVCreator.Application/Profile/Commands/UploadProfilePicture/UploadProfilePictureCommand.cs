using CVCreator.Application.Common.Interfaces;
using MediatR;
using ProfileEntity = CVCreator.Domain.Entities.Profile;
using Microsoft.EntityFrameworkCore;

namespace CVCreator.Application.Profile.Commands.UploadProfilePicture;

public record UploadProfilePictureCommand(Stream FileStream, string ContentType, string FileExtension)
    : IRequest<string>;

public class UploadProfilePictureCommandHandler(
    IApplicationDbContext db,
    ICurrentUserService currentUser,
    IFileStorage fileStorage)
    : IRequestHandler<UploadProfilePictureCommand, string>
{
    public async Task<string> Handle(UploadProfilePictureCommand request, CancellationToken ct)
    {
        var userId = currentUser.UserId!;
        var key = $"{userId}/{Guid.NewGuid()}{request.FileExtension}";
        var uri = await fileStorage.UploadAsync(request.FileStream, request.ContentType, key);

        var profile = await db.Profiles.FirstOrDefaultAsync(p => p.UserId == userId, ct);
        if (profile is null)
        {
            profile = new ProfileEntity { UserId = userId };
            db.Profiles.Add(profile);
        }
        profile.PictureUrl = uri.ToString();
        await db.SaveChangesAsync(ct);

        return uri.ToString();
    }
}
