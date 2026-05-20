using CVCreator.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using EducationEntity = CVCreator.Domain.Entities.Education;

namespace CVCreator.Application.Profile.Education;

public record EducationDto(Guid Id, string? DegreeSv, string? DegreeEn, string School, int StartYear, int? EndYear);

public record CreateEducationCommand(string? DegreeSv, string? DegreeEn, string School, int StartYear, int? EndYear) : IRequest<EducationDto>;
public record UpdateEducationCommand(Guid Id, string? DegreeSv, string? DegreeEn, string School, int StartYear, int? EndYear) : IRequest<EducationDto?>;
public record DeleteEducationCommand(Guid Id) : IRequest<bool>;
public record GetEducationsQuery : IRequest<List<EducationDto>>;

public class CreateEducationHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<CreateEducationCommand, EducationDto>
{
    public async Task<EducationDto> Handle(CreateEducationCommand req, CancellationToken ct)
    {
        var e = new EducationEntity
        {
            UserId = currentUser.UserId!,
            DegreeSv = req.DegreeSv, DegreeEn = req.DegreeEn,
            School = req.School, StartYear = req.StartYear, EndYear = req.EndYear
        };
        db.Educations.Add(e);
        await db.SaveChangesAsync(ct);
        return new EducationDto(e.Id, e.DegreeSv, e.DegreeEn, e.School, e.StartYear, e.EndYear);
    }
}

public class GetEducationsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetEducationsQuery, List<EducationDto>>
{
    public async Task<List<EducationDto>> Handle(GetEducationsQuery req, CancellationToken ct)
        => await db.Educations
            .Where(e => e.UserId == currentUser.UserId)
            .Select(e => new EducationDto(e.Id, e.DegreeSv, e.DegreeEn, e.School, e.StartYear, e.EndYear))
            .ToListAsync(ct);
}

public class UpdateEducationHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<UpdateEducationCommand, EducationDto?>
{
    public async Task<EducationDto?> Handle(UpdateEducationCommand req, CancellationToken ct)
    {
        var e = await db.Educations.FirstOrDefaultAsync(x => x.Id == req.Id && x.UserId == currentUser.UserId, ct);
        if (e is null) return null;
        e.DegreeSv = req.DegreeSv; e.DegreeEn = req.DegreeEn;
        e.School = req.School; e.StartYear = req.StartYear; e.EndYear = req.EndYear;
        await db.SaveChangesAsync(ct);
        return new EducationDto(e.Id, e.DegreeSv, e.DegreeEn, e.School, e.StartYear, e.EndYear);
    }
}

public class DeleteEducationHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<DeleteEducationCommand, bool>
{
    public async Task<bool> Handle(DeleteEducationCommand req, CancellationToken ct)
    {
        var e = await db.Educations.FirstOrDefaultAsync(x => x.Id == req.Id && x.UserId == currentUser.UserId, ct);
        if (e is null) return false;
        db.Educations.Remove(e);
        await db.SaveChangesAsync(ct);
        return true;
    }
}
