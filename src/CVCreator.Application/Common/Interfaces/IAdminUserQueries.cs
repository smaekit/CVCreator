namespace CVCreator.Application.Common.Interfaces;

/// <summary>
/// Read-only queries against the Identity user store, scoped to admin-stats use.
/// Exposed via interface so the Application layer doesn't need to know about
/// ApplicationUser / IdentityDbContext.
/// </summary>
public interface IAdminUserQueries
{
    Task<int> TotalUsersAsync(DateTime? createdBefore, CancellationToken ct);

    /// <summary>(CreatedAt, Email) for all users created since the cutoff, sorted ascending.</summary>
    Task<IReadOnlyList<(DateTime CreatedAt, string Email)>> NewUsersSinceAsync(DateTime since, CancellationToken ct);

    /// <summary>Most recent N users for the activity feed, newest first.</summary>
    Task<IReadOnlyList<(DateTime CreatedAt, string Email)>> RecentUsersAsync(int limit, CancellationToken ct);

    /// <summary>UserId → Email map for the given IDs, used to enrich activity events.</summary>
    Task<IReadOnlyDictionary<string, string>> EmailsByUserIdAsync(IReadOnlyCollection<string> userIds, CancellationToken ct);
}
