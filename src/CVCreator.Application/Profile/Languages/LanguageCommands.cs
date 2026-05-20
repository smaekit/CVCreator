using CVCreator.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;
using LanguageEntity = CVCreator.Domain.Entities.Language;

namespace CVCreator.Application.Profile.Languages;

public record LanguageDto(Guid Id, string Name, string Proficiency);

public record CreateLanguageCommand(string Name, string Proficiency) : IRequest<LanguageDto>;
public record UpdateLanguageCommand(Guid Id, string Name, string Proficiency) : IRequest<LanguageDto?>;
public record DeleteLanguageCommand(Guid Id) : IRequest<bool>;
public record GetLanguagesQuery : IRequest<List<LanguageDto>>;

public class CreateLanguageHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<CreateLanguageCommand, LanguageDto>
{
    public async Task<LanguageDto> Handle(CreateLanguageCommand req, CancellationToken ct)
    {
        var l = new LanguageEntity { UserId = currentUser.UserId!, Name = req.Name, Proficiency = req.Proficiency };
        db.Languages.Add(l);
        await db.SaveChangesAsync(ct);
        return new LanguageDto(l.Id, l.Name, l.Proficiency);
    }
}

public class GetLanguagesHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<GetLanguagesQuery, List<LanguageDto>>
{
    public async Task<List<LanguageDto>> Handle(GetLanguagesQuery req, CancellationToken ct)
        => await db.Languages
            .Where(l => l.UserId == currentUser.UserId)
            .Select(l => new LanguageDto(l.Id, l.Name, l.Proficiency))
            .ToListAsync(ct);
}

public class UpdateLanguageHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<UpdateLanguageCommand, LanguageDto?>
{
    public async Task<LanguageDto?> Handle(UpdateLanguageCommand req, CancellationToken ct)
    {
        var l = await db.Languages.FirstOrDefaultAsync(x => x.Id == req.Id && x.UserId == currentUser.UserId, ct);
        if (l is null) return null;
        l.Name = req.Name; l.Proficiency = req.Proficiency;
        await db.SaveChangesAsync(ct);
        return new LanguageDto(l.Id, l.Name, l.Proficiency);
    }
}

public class DeleteLanguageHandler(IApplicationDbContext db, ICurrentUserService currentUser)
    : IRequestHandler<DeleteLanguageCommand, bool>
{
    public async Task<bool> Handle(DeleteLanguageCommand req, CancellationToken ct)
    {
        var l = await db.Languages.FirstOrDefaultAsync(x => x.Id == req.Id && x.UserId == currentUser.UserId, ct);
        if (l is null) return false;
        db.Languages.Remove(l);
        await db.SaveChangesAsync(ct);
        return true;
    }
}
