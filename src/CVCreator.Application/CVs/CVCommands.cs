using CVCreator.Application.Common.Interfaces;
using CVCreator.Domain.Services;
using MediatR;
using Microsoft.EntityFrameworkCore;
using CVEntity = CVCreator.Domain.Entities.CV;

namespace CVCreator.Application.CVs;

public record CvDto(Guid Id, string Name, string Company, string Language, DateTime CreatedAt);

public record CreateCvCommand(string Company, string Language) : IRequest<CvDto>;
public record GetCvsQuery : IRequest<List<CvDto>>;
public record DeleteCvCommand(Guid Id) : IRequest<bool>;

public class CreateCvHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<CreateCvCommand, CvDto>
{
    public async Task<CvDto> Handle(CreateCvCommand req, CancellationToken ct)
    {
        var profile = await db.Profiles.FirstOrDefaultAsync(p => p.UserId == currentUser.UserId, ct);
        var firstName = profile?.FirstName ?? "";
        var lastName = profile?.LastName ?? "";
        var name = CVNameGenerator.Generate(firstName, lastName, req.Company, req.Language);

        var cv = new CVEntity
        {
            UserId = currentUser.UserId!,
            Company = req.Company,
            Language = req.Language,
            Name = name
        };
        db.CVs.Add(cv);
        await db.SaveChangesAsync(ct);
        return new CvDto(cv.Id, cv.Name, cv.Company, cv.Language, cv.CreatedAt);
    }
}

public class GetCvsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetCvsQuery, List<CvDto>>
{
    public async Task<List<CvDto>> Handle(GetCvsQuery req, CancellationToken ct)
        => await db.CVs
            .Where(c => c.UserId == currentUser.UserId)
            .OrderByDescending(c => c.CreatedAt)
            .Select(c => new CvDto(c.Id, c.Name, c.Company, c.Language, c.CreatedAt))
            .ToListAsync(ct);
}

public class DeleteCvHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<DeleteCvCommand, bool>
{
    public async Task<bool> Handle(DeleteCvCommand req, CancellationToken ct)
    {
        var cv = await db.CVs.FirstOrDefaultAsync(c => c.Id == req.Id && c.UserId == currentUser.UserId, ct);
        if (cv is null) return false;
        db.CVs.Remove(cv);
        await db.SaveChangesAsync(ct);
        return true;
    }
}
