using CVCreator.Application.Common.Interfaces;
using CVCreator.Domain.Entities;
using CVCreator.Domain.Services;
using CVCreator.Domain.ViewModels;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CVCreator.Application.CVs;

public record GetCvForPreviewQuery(Guid CvId) : IRequest<ResolvedCv?>;

public class GetCvForPreviewHandler(IApplicationDbContext db)
    : IRequestHandler<GetCvForPreviewQuery, ResolvedCv?>
{
    public async Task<ResolvedCv?> Handle(GetCvForPreviewQuery request, CancellationToken ct)
    {
        var cv = await db.CVs.FirstOrDefaultAsync(c => c.Id == request.CvId, ct);
        if (cv is null) return null;

        var profile = await db.Profiles.FirstOrDefaultAsync(p => p.UserId == cv.UserId, ct)
            ?? new() { UserId = cv.UserId };

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

        var assignmentIds = cvAssignments.Select(x => x.a.Id).ToList();
        var assignmentSkillNames = assignmentIds.Count > 0
            ? (await db.Assignments
                .Where(a => assignmentIds.Contains(a.Id))
                .Select(a => new
                {
                    AssignmentId = a.Id,
                    Skills = a.AssignmentSkills.Select(s => s.Skill.Name).ToList()
                })
                .ToListAsync(ct))
                .ToDictionary(x => x.AssignmentId, x => x.Skills)
            : new Dictionary<Guid, List<string>>();

        var groups = await db.CVFrontPageGroups
            .Include(g => g.Items)
            .Where(g => g.CVId == cv.Id)
            .OrderBy(g => g.DisplayOrder)
            .ToListAsync(ct);

        var skillIds = groups.SelectMany(g => g.Items)
            .Where(i => i.SkillId.HasValue).Select(i => i.SkillId!.Value).ToHashSet();
        var certIds = groups.SelectMany(g => g.Items)
            .Where(i => i.CertificationId.HasValue).Select(i => i.CertificationId!.Value).ToHashSet();

        var skillNames = skillIds.Count > 0
            ? await db.Skills.Where(s => skillIds.Contains(s.Id))
                .ToDictionaryAsync(s => s.Id, s => s.Name, ct)
            : new Dictionary<Guid, string>();

        var certList = certIds.Count > 0
            ? await db.Certifications.Where(c => certIds.Contains(c.Id)).ToListAsync(ct)
            : new List<Certification>();

        var lang = cv.Language;
        var resolvedGroups = groups.Select(g =>
        {
            var header = BilingualTextResolver.Resolve(g.HeaderSv, g.HeaderEn, lang);
            var items = g.Items.OrderBy(i => i.DisplayOrder).Select(i =>
            {
                string label;
                if (i.SkillId.HasValue)
                {
                    skillNames.TryGetValue(i.SkillId.Value, out label!);
                    label ??= "";
                }
                else if (i.CertificationId.HasValue)
                {
                    var cert = certList.FirstOrDefault(c => c.Id == i.CertificationId.Value);
                    label = cert is not null
                        ? BilingualTextResolver.Resolve(cert.NameSv, cert.NameEn, lang).Text
                        : "";
                }
                else label = "";
                return new ResolvedFrontPageGroupItem(i.Id, label, i.DisplayOrder);
            }).ToList();
            return new ResolvedFrontPageGroup(g.Id, header.Text, header.FallbackUsed, g.DisplayOrder, items);
        }).ToList();

        return CVCompositionService.Compose(
            profile, cv,
            cvAssignments.Select(x => (x.cva, x.a)).ToList(),
            cvSkills.Select(x => (x.cvs, x.s)).ToList(),
            cvEducations.Select(x => (x.cve, x.e)).ToList(),
            cvCerts.Select(x => (x.cvc, x.c)).ToList(),
            cvLangs.Select(x => (x.cvl, x.l)).ToList(),
            resolvedGroups,
            assignmentSkillNames);
    }
}
