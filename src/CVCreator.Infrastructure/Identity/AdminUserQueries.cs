using CVCreator.Application.Common.Interfaces;
using CVCreator.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;

namespace CVCreator.Infrastructure.Identity;

public class AdminUserQueries(AppDbContext db) : IAdminUserQueries
{
    public Task<int> TotalUsersAsync(DateTime? createdBefore, CancellationToken ct)
        => createdBefore is { } cutoff
            ? db.Users.CountAsync(u => u.CreatedAt < cutoff, ct)
            : db.Users.CountAsync(ct);

    public async Task<IReadOnlyList<(DateTime CreatedAt, string Email)>> NewUsersSinceAsync(DateTime since, CancellationToken ct)
    {
        var rows = await db.Users
            .Where(u => u.CreatedAt >= since && u.Email != null)
            .OrderBy(u => u.CreatedAt)
            .Select(u => new { u.CreatedAt, u.Email })
            .ToListAsync(ct);
        return rows.Select(r => (r.CreatedAt, r.Email!)).ToList();
    }

    public async Task<IReadOnlyList<(DateTime CreatedAt, string Email)>> RecentUsersAsync(int limit, CancellationToken ct)
    {
        var rows = await db.Users
            .Where(u => u.Email != null)
            .OrderByDescending(u => u.CreatedAt)
            .Take(limit)
            .Select(u => new { u.CreatedAt, u.Email })
            .ToListAsync(ct);
        return rows.Select(r => (r.CreatedAt, r.Email!)).ToList();
    }

    public async Task<IReadOnlyDictionary<string, string>> EmailsByUserIdAsync(IReadOnlyCollection<string> userIds, CancellationToken ct)
    {
        if (userIds.Count == 0) return new Dictionary<string, string>();
        var rows = await db.Users
            .Where(u => userIds.Contains(u.Id) && u.Email != null)
            .Select(u => new { u.Id, u.Email })
            .ToListAsync(ct);
        return rows.ToDictionary(r => r.Id, r => r.Email!);
    }
}
