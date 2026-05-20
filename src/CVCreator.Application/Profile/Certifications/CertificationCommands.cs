using CVCreator.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using CertificationEntity = CVCreator.Domain.Entities.Certification;

namespace CVCreator.Application.Profile.Certifications;

public record CertificationDto(Guid Id, string? NameSv, string? NameEn, int Year, string? Link);

public record CreateCertificationCommand(string? NameSv, string? NameEn, int Year, string? Link) : IRequest<CertificationDto>;
public record UpdateCertificationCommand(Guid Id, string? NameSv, string? NameEn, int Year, string? Link) : IRequest<CertificationDto?>;
public record DeleteCertificationCommand(Guid Id) : IRequest<bool>;
public record GetCertificationsQuery : IRequest<List<CertificationDto>>;

public class CreateCertificationHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<CreateCertificationCommand, CertificationDto>
{
    public async Task<CertificationDto> Handle(CreateCertificationCommand req, CancellationToken ct)
    {
        var c = new CertificationEntity { UserId = currentUser.UserId!, NameSv = req.NameSv, NameEn = req.NameEn, Year = req.Year, Link = req.Link };
        db.Certifications.Add(c);
        await db.SaveChangesAsync(ct);
        return new CertificationDto(c.Id, c.NameSv, c.NameEn, c.Year, c.Link);
    }
}

public class GetCertificationsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetCertificationsQuery, List<CertificationDto>>
{
    public async Task<List<CertificationDto>> Handle(GetCertificationsQuery req, CancellationToken ct)
        => await db.Certifications
            .Where(c => c.UserId == currentUser.UserId)
            .Select(c => new CertificationDto(c.Id, c.NameSv, c.NameEn, c.Year, c.Link))
            .ToListAsync(ct);
}

public class UpdateCertificationHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<UpdateCertificationCommand, CertificationDto?>
{
    public async Task<CertificationDto?> Handle(UpdateCertificationCommand req, CancellationToken ct)
    {
        var c = await db.Certifications.FirstOrDefaultAsync(x => x.Id == req.Id && x.UserId == currentUser.UserId, ct);
        if (c is null) return null;
        c.NameSv = req.NameSv; c.NameEn = req.NameEn; c.Year = req.Year; c.Link = req.Link;
        await db.SaveChangesAsync(ct);
        return new CertificationDto(c.Id, c.NameSv, c.NameEn, c.Year, c.Link);
    }
}

public class DeleteCertificationHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<DeleteCertificationCommand, bool>
{
    public async Task<bool> Handle(DeleteCertificationCommand req, CancellationToken ct)
    {
        var c = await db.Certifications.FirstOrDefaultAsync(x => x.Id == req.Id && x.UserId == currentUser.UserId, ct);
        if (c is null) return false;
        db.Certifications.Remove(c);
        await db.SaveChangesAsync(ct);
        return true;
    }
}
