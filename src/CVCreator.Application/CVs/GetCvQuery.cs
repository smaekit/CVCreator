using CVCreator.Application.Common.Interfaces;
using CVCreator.Domain.Services;
using CVCreator.Domain.ViewModels;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CVCreator.Application.CVs;

public record GetCvQuery(Guid Id) : IRequest<ResolvedCv?>;

public class GetCvHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetCvQuery, ResolvedCv?>
{
    public async Task<ResolvedCv?> Handle(GetCvQuery request, CancellationToken ct)
    {
        var cv = await db.CVs.FirstOrDefaultAsync(c => c.Id == request.Id && c.UserId == currentUser.UserId, ct);
        if (cv is null) return null;

        var profile = await db.Profiles.FirstOrDefaultAsync(p => p.UserId == currentUser.UserId, ct)
            ?? new() { UserId = currentUser.UserId! };

        var cvAssignments = await db.CVAssignments
            .Where(a => a.CVId == cv.Id)
            .Join(db.Assignments, a => a.AssignmentId, a => a.Id, (cva, a) => new { cva, a })
            .ToListAsync(ct);

        var cvSkills = await db.CVSkills
            .Where(s => s.CVId == cv.Id)
            .Join(db.Skills, s => s.SkillId, s => s.Id, (cvs, s) => new { cvs, s })
            .ToListAsync(ct);

        var cvEducations = await db.CVEducations
            .Where(e => e.CVId == cv.Id)
            .Join(db.Educations, e => e.EducationId, e => e.Id, (cve, e) => new { cve, e })
            .ToListAsync(ct);

        var cvCerts = await db.CVCertifications
            .Where(c => c.CVId == cv.Id)
            .Join(db.Certifications, c => c.CertificationId, c => c.Id, (cvc, c) => new { cvc, c })
            .ToListAsync(ct);

        var cvLangs = await db.CVLanguages
            .Where(l => l.CVId == cv.Id)
            .Join(db.Languages, l => l.LanguageId, l => l.Id, (cvl, l) => new { cvl, l })
            .ToListAsync(ct);

        return CVCompositionService.Compose(
            profile, cv,
            cvAssignments.Select(x => (x.cva, x.a)).ToList(),
            cvSkills.Select(x => (x.cvs, x.s)).ToList(),
            cvEducations.Select(x => (x.cve, x.e)).ToList(),
            cvCerts.Select(x => (x.cvc, x.c)).ToList(),
            cvLangs.Select(x => (x.cvl, x.l)).ToList());
    }
}
