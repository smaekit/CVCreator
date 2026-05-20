using CVCreator.Application.Common.Interfaces;
using CVCreator.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CVCreator.Application.CVs;

public record SelectionItem(Guid Id, int DisplayOrder, bool IsHighlighted = false, string? DescriptionOverride = null);

public record UpdateCvSelectionsCommand(
    Guid CvId,
    List<SelectionItem> Assignments,
    List<SelectionItem> Skills,
    List<SelectionItem> Educations,
    List<SelectionItem> Certifications,
    List<SelectionItem> Languages) : IRequest<bool>;

public class UpdateCvSelectionsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<UpdateCvSelectionsCommand, bool>
{
    public async Task<bool> Handle(UpdateCvSelectionsCommand req, CancellationToken ct)
    {
        var cv = await db.CVs.FirstOrDefaultAsync(c => c.Id == req.CvId && c.UserId == currentUser.UserId, ct);
        if (cv is null) return false;

        if (req.Assignments.Count(a => a.IsHighlighted) > 2)
            throw new InvalidOperationException("Cannot highlight more than 2 assignments.");

        await ReplaceJoins(db.CVAssignments, req.CvId,
            req.Assignments.Select(a => new CVAssignment
            {
                CVId = req.CvId, AssignmentId = a.Id,
                DisplayOrder = a.DisplayOrder, IsHighlighted = a.IsHighlighted,
                DescriptionOverride = a.DescriptionOverride
            }), ct);

        await ReplaceJoins(db.CVSkills, req.CvId,
            req.Skills.Select(s => new CVSkill { CVId = req.CvId, SkillId = s.Id, DisplayOrder = s.DisplayOrder }), ct);

        await ReplaceJoins(db.CVEducations, req.CvId,
            req.Educations.Select(e => new CVEducation { CVId = req.CvId, EducationId = e.Id, DisplayOrder = e.DisplayOrder }), ct);

        await ReplaceJoins(db.CVCertifications, req.CvId,
            req.Certifications.Select(c => new CVCertification { CVId = req.CvId, CertificationId = c.Id, DisplayOrder = c.DisplayOrder }), ct);

        await ReplaceJoins(db.CVLanguages, req.CvId,
            req.Languages.Select(l => new CVLanguage { CVId = req.CvId, LanguageId = l.Id, DisplayOrder = l.DisplayOrder }), ct);

        await db.SaveChangesAsync(ct);
        return true;
    }

    private static async Task ReplaceJoins<T>(Microsoft.EntityFrameworkCore.DbSet<T> set, Guid cvId,
        IEnumerable<T> newItems, CancellationToken ct) where T : class
    {
        var existing = await set.Where(e => EF.Property<Guid>(e, "CVId") == cvId).ToListAsync(ct);
        set.RemoveRange(existing);
        set.AddRange(newItems);
    }
}
