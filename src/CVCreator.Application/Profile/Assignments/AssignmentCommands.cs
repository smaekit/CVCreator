using CVCreator.Application.Common.Interfaces;
using CVCreator.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CVCreator.Application.Profile.Assignments;

public record AssignmentDto(
    Guid Id, string? TitleSv, string? TitleEn,
    string? DescriptionSv, string? DescriptionEn,
    string Client, string StartDate, string? EndDate,
    List<Guid> SkillIds);

public record CreateAssignmentCommand(
    string? TitleSv, string? TitleEn,
    string? DescriptionSv, string? DescriptionEn,
    string Client, string StartDate, string? EndDate = null) : IRequest<AssignmentDto>;

public record UpdateAssignmentCommand(
    Guid Id, string? TitleSv, string? TitleEn,
    string? DescriptionSv, string? DescriptionEn,
    string Client, string StartDate, string? EndDate = null) : IRequest<AssignmentDto?>;

public record DeleteAssignmentCommand(Guid Id) : IRequest<bool>;
public record GetAssignmentsQuery : IRequest<List<AssignmentDto>>;
public record GetAssignmentQuery(Guid Id) : IRequest<AssignmentDto?>;
public record AttachSkillCommand(Guid AssignmentId, Guid SkillId) : IRequest<bool>;
public record DetachSkillCommand(Guid AssignmentId, Guid SkillId) : IRequest<bool>;
public record SetAssignmentSkillsCommand(Guid AssignmentId, List<string> SkillNames) : IRequest<bool>;

public class CreateAssignmentHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<CreateAssignmentCommand, AssignmentDto>
{
    public async Task<AssignmentDto> Handle(CreateAssignmentCommand req, CancellationToken ct)
    {
        var a = new Assignment
        {
            UserId = currentUser.UserId!,
            TitleSv = req.TitleSv, TitleEn = req.TitleEn,
            DescriptionSv = req.DescriptionSv, DescriptionEn = req.DescriptionEn,
            Client = req.Client,
            StartDate = DateOnly.Parse(req.StartDate),
            EndDate = req.EndDate is null ? null : DateOnly.Parse(req.EndDate)
        };
        db.Assignments.Add(a);
        await db.SaveChangesAsync(ct);
        return AssignmentExtensions.ToDto(a);
    }
}

public class GetAssignmentsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetAssignmentsQuery, List<AssignmentDto>>
{
    public async Task<List<AssignmentDto>> Handle(GetAssignmentsQuery req, CancellationToken ct)
        => await db.Assignments
            .Include(a => a.AssignmentSkills)
            .Where(a => a.UserId == currentUser.UserId)
            .OrderByDescending(a => a.StartDate)
            .Select(a => new AssignmentDto(
                a.Id, a.TitleSv, a.TitleEn, a.DescriptionSv, a.DescriptionEn,
                a.Client, a.StartDate.ToString("yyyy-MM-dd"),
                a.EndDate == null ? null : a.EndDate.Value.ToString("yyyy-MM-dd"),
                a.AssignmentSkills.Select(s => s.SkillId).ToList()))
            .ToListAsync(ct);
}

public class GetAssignmentHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetAssignmentQuery, AssignmentDto?>
{
    public async Task<AssignmentDto?> Handle(GetAssignmentQuery req, CancellationToken ct)
    {
        var a = await db.Assignments
            .Include(a => a.AssignmentSkills)
            .FirstOrDefaultAsync(a => a.Id == req.Id && a.UserId == currentUser.UserId, ct);
        return a is null ? null : AssignmentExtensions.ToDto(a);
    }
}

public class UpdateAssignmentHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<UpdateAssignmentCommand, AssignmentDto?>
{
    public async Task<AssignmentDto?> Handle(UpdateAssignmentCommand req, CancellationToken ct)
    {
        var a = await db.Assignments
            .Include(a => a.AssignmentSkills)
            .FirstOrDefaultAsync(a => a.Id == req.Id && a.UserId == currentUser.UserId, ct);
        if (a is null) return null;
        a.TitleSv = req.TitleSv; a.TitleEn = req.TitleEn;
        a.DescriptionSv = req.DescriptionSv; a.DescriptionEn = req.DescriptionEn;
        a.Client = req.Client;
        a.StartDate = DateOnly.Parse(req.StartDate);
        a.EndDate = req.EndDate is null ? null : DateOnly.Parse(req.EndDate);
        await db.SaveChangesAsync(ct);
        return AssignmentExtensions.ToDto(a);
    }
}

public class DeleteAssignmentHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<DeleteAssignmentCommand, bool>
{
    public async Task<bool> Handle(DeleteAssignmentCommand req, CancellationToken ct)
    {
        var a = await db.Assignments.FirstOrDefaultAsync(a => a.Id == req.Id && a.UserId == currentUser.UserId, ct);
        if (a is null) return false;
        db.Assignments.Remove(a);
        await db.SaveChangesAsync(ct);
        return true;
    }
}

public class SetAssignmentSkillsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<SetAssignmentSkillsCommand, bool>
{
    public async Task<bool> Handle(SetAssignmentSkillsCommand req, CancellationToken ct)
    {
        var assignment = await db.Assignments
            .Include(a => a.AssignmentSkills)
            .FirstOrDefaultAsync(a => a.Id == req.AssignmentId && a.UserId == currentUser.UserId, ct);
        if (assignment is null) return false;

        var skillIds = new List<Guid>();
        foreach (var raw in req.SkillNames)
        {
            var name = raw.Trim();
            if (string.IsNullOrEmpty(name)) continue;
            var lower = name.ToLower();
            var skill = await db.Skills.FirstOrDefaultAsync(
                s => s.UserId == currentUser.UserId && s.Name.ToLower() == lower, ct);
            if (skill is null)
            {
                skill = new Skill { UserId = currentUser.UserId!, Name = name };
                db.Skills.Add(skill);
                await db.SaveChangesAsync(ct);
            }
            skillIds.Add(skill.Id);
        }

        assignment.AssignmentSkills.Clear();
        foreach (var skillId in skillIds)
            assignment.AssignmentSkills.Add(new AssignmentSkill { AssignmentId = req.AssignmentId, SkillId = skillId });
        await db.SaveChangesAsync(ct);
        return true;
    }
}

public class AttachSkillHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<AttachSkillCommand, bool>
{
    public async Task<bool> Handle(AttachSkillCommand req, CancellationToken ct)
    {
        var assignment = await db.Assignments
            .Include(a => a.AssignmentSkills)
            .FirstOrDefaultAsync(a => a.Id == req.AssignmentId && a.UserId == currentUser.UserId, ct);
        if (assignment is null) return false;
        if (assignment.AssignmentSkills.Any(s => s.SkillId == req.SkillId)) return true;
        assignment.AssignmentSkills.Add(new AssignmentSkill { AssignmentId = req.AssignmentId, SkillId = req.SkillId });
        await db.SaveChangesAsync(ct);
        return true;
    }
}

public class DetachSkillHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<DetachSkillCommand, bool>
{
    public async Task<bool> Handle(DetachSkillCommand req, CancellationToken ct)
    {
        var assignment = await db.Assignments
            .Include(a => a.AssignmentSkills)
            .FirstOrDefaultAsync(a => a.Id == req.AssignmentId && a.UserId == currentUser.UserId, ct);
        var link = assignment?.AssignmentSkills.FirstOrDefault(s => s.SkillId == req.SkillId);
        if (link is null) return false;
        assignment!.AssignmentSkills.Remove(link);
        await db.SaveChangesAsync(ct);
        return true;
    }
}

file static class AssignmentExtensions
{
    public static AssignmentDto ToDto(Assignment a) => new(
        a.Id, a.TitleSv, a.TitleEn, a.DescriptionSv, a.DescriptionEn,
        a.Client, a.StartDate.ToString("yyyy-MM-dd"),
        a.EndDate?.ToString("yyyy-MM-dd"),
        a.AssignmentSkills.Select(s => s.SkillId).ToList());
}
