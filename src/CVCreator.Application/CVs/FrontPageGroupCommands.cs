using CVCreator.Application.Common.Interfaces;
using CVCreator.Domain.Entities;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CVCreator.Application.CVs;

public record FrontPageGroupDto(Guid Id, string? HeaderSv, string? HeaderEn, int DisplayOrder, List<FrontPageGroupItemDto> Items);
public record FrontPageGroupItemDto(Guid Id, Guid? SkillId, Guid? CertificationId, int DisplayOrder);

public record CreateFrontPageGroupCommand(Guid CvId, string? HeaderSv, string? HeaderEn, int DisplayOrder) : IRequest<FrontPageGroupDto?>;
public record UpdateFrontPageGroupCommand(Guid CvId, Guid GroupId, string? HeaderSv, string? HeaderEn, int DisplayOrder, List<FrontPageGroupItemRequest> Items) : IRequest<FrontPageGroupDto?>;
public record DeleteFrontPageGroupCommand(Guid CvId, Guid GroupId) : IRequest<bool>;
public record GetFrontPageGroupsQuery(Guid CvId) : IRequest<List<FrontPageGroupDto>>;

public record FrontPageGroupItemRequest(Guid? SkillId, Guid? CertificationId, int DisplayOrder);

public class CreateFrontPageGroupHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<CreateFrontPageGroupCommand, FrontPageGroupDto?>
{
    public async Task<FrontPageGroupDto?> Handle(CreateFrontPageGroupCommand req, CancellationToken ct)
    {
        var cv = await db.CVs.FirstOrDefaultAsync(c => c.Id == req.CvId && c.UserId == currentUser.UserId, ct);
        if (cv is null) return null;

        var group = new CVFrontPageGroup
        {
            CVId = req.CvId, HeaderSv = req.HeaderSv, HeaderEn = req.HeaderEn, DisplayOrder = req.DisplayOrder
        };
        db.CVFrontPageGroups.Add(group);
        await db.SaveChangesAsync(ct);
        return new FrontPageGroupDto(group.Id, group.HeaderSv, group.HeaderEn, group.DisplayOrder, []);
    }
}

public class GetFrontPageGroupsHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetFrontPageGroupsQuery, List<FrontPageGroupDto>>
{
    public async Task<List<FrontPageGroupDto>> Handle(GetFrontPageGroupsQuery req, CancellationToken ct)
    {
        var cv = await db.CVs.FirstOrDefaultAsync(c => c.Id == req.CvId && c.UserId == currentUser.UserId, ct);
        if (cv is null) return [];

        return await db.CVFrontPageGroups
            .Include(g => g.Items)
            .Where(g => g.CVId == req.CvId)
            .OrderBy(g => g.DisplayOrder)
            .Select(g => new FrontPageGroupDto(g.Id, g.HeaderSv, g.HeaderEn, g.DisplayOrder,
                g.Items.OrderBy(i => i.DisplayOrder)
                    .Select(i => new FrontPageGroupItemDto(i.Id, i.SkillId, i.CertificationId, i.DisplayOrder))
                    .ToList()))
            .ToListAsync(ct);
    }
}

public class UpdateFrontPageGroupHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<UpdateFrontPageGroupCommand, FrontPageGroupDto?>
{
    public async Task<FrontPageGroupDto?> Handle(UpdateFrontPageGroupCommand req, CancellationToken ct)
    {
        var group = await db.CVFrontPageGroups
            .Include(g => g.Items)
            .FirstOrDefaultAsync(g => g.Id == req.GroupId && g.CVId == req.CvId, ct);
        if (group is null) return null;

        var cv = await db.CVs.FirstOrDefaultAsync(c => c.Id == req.CvId && c.UserId == currentUser.UserId, ct);
        if (cv is null) return null;

        group.HeaderSv = req.HeaderSv;
        group.HeaderEn = req.HeaderEn;
        group.DisplayOrder = req.DisplayOrder;
        group.Items.Clear();
        foreach (var item in req.Items)
            group.Items.Add(new CVFrontPageGroupItem
            {
                GroupId = group.Id, SkillId = item.SkillId,
                CertificationId = item.CertificationId, DisplayOrder = item.DisplayOrder
            });
        await db.SaveChangesAsync(ct);

        return new FrontPageGroupDto(group.Id, group.HeaderSv, group.HeaderEn, group.DisplayOrder,
            group.Items.Select(i => new FrontPageGroupItemDto(i.Id, i.SkillId, i.CertificationId, i.DisplayOrder)).ToList());
    }
}

public class DeleteFrontPageGroupHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<DeleteFrontPageGroupCommand, bool>
{
    public async Task<bool> Handle(DeleteFrontPageGroupCommand req, CancellationToken ct)
    {
        var group = await db.CVFrontPageGroups
            .FirstOrDefaultAsync(g => g.Id == req.GroupId && g.CVId == req.CvId, ct);
        if (group is null) return false;
        var cv = await db.CVs.FirstOrDefaultAsync(c => c.Id == req.CvId && c.UserId == currentUser.UserId, ct);
        if (cv is null) return false;

        db.CVFrontPageGroups.Remove(group);
        await db.SaveChangesAsync(ct);
        return true;
    }
}
