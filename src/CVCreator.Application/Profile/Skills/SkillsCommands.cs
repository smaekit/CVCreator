using CVCreator.Application.Common.Interfaces;
using CVCreator.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CVCreator.Application.Profile.Skills;

public record SkillDto(Guid Id, string Name, string? Category);

public record CreateSkillCommand(string Name, string? Category) : IRequest<SkillDto>;
public record UpdateSkillCommand(Guid Id, string Name, string? Category) : IRequest<SkillDto?>;
public record DeleteSkillCommand(Guid Id) : IRequest<bool>;
public record GetSkillsQuery : IRequest<List<SkillDto>>;

public class CreateSkillHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<CreateSkillCommand, SkillDto>
{
    public async Task<SkillDto> Handle(CreateSkillCommand request, CancellationToken ct)
    {
        var skill = new Skill { UserId = currentUser.UserId!, Name = request.Name, Category = request.Category };
        db.Skills.Add(skill);
        await db.SaveChangesAsync(ct);
        return new SkillDto(skill.Id, skill.Name, skill.Category);
    }
}

public class GetSkillsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetSkillsQuery, List<SkillDto>>
{
    public async Task<List<SkillDto>> Handle(GetSkillsQuery request, CancellationToken ct)
        => await db.Skills
            .Where(s => s.UserId == currentUser.UserId)
            .Select(s => new SkillDto(s.Id, s.Name, s.Category))
            .ToListAsync(ct);
}

public class UpdateSkillHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<UpdateSkillCommand, SkillDto?>
{
    public async Task<SkillDto?> Handle(UpdateSkillCommand request, CancellationToken ct)
    {
        var skill = await db.Skills.FirstOrDefaultAsync(
            s => s.Id == request.Id && s.UserId == currentUser.UserId, ct);
        if (skill is null) return null;
        skill.Name = request.Name;
        skill.Category = request.Category;
        await db.SaveChangesAsync(ct);
        return new SkillDto(skill.Id, skill.Name, skill.Category);
    }
}

public class DeleteSkillHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<DeleteSkillCommand, bool>
{
    public async Task<bool> Handle(DeleteSkillCommand request, CancellationToken ct)
    {
        var skill = await db.Skills.FirstOrDefaultAsync(
            s => s.Id == request.Id && s.UserId == currentUser.UserId, ct);
        if (skill is null) return false;
        db.Skills.Remove(skill);
        await db.SaveChangesAsync(ct);
        return true;
    }
}
