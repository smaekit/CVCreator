using CVCreator.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CVCreator.Application.Admin.GetAdminStats;

public record GetAdminStatsQuery(int Days = 30) : IRequest<AdminStatsDto>;

public class GetAdminStatsQueryHandler(
    IApplicationDbContext db,
    IAdminUserQueries userQueries) : IRequestHandler<GetAdminStatsQuery, AdminStatsDto>
{
    // ── Tunables (hardcoded by design — see ADR 0001) ──────────────────────────
    private const int SparkDays = 14;
    private const int TopCompaniesLimit = 10;
    private const int ActivityLimit = 8;
    private const int WeeklyBuckets = 12;
    private const int MonthlyBuckets = 12;
    private const int PricingTargetUsers = 500;

    // Pricing thresholds — gut-feel SaaS heuristics. Tune in PR, not config.
    private const int ActiveUsersThreshold = 100;
    private const double ActivationRateThreshold = 0.30;
    private const double RepeatRateThreshold = 0.30;
    private const int WeeklyGrowthThreshold = 8;
    private const double AvgCvsThreshold = 2.0;

    public async Task<AdminStatsDto> Handle(GetAdminStatsQuery request, CancellationToken ct)
    {
        var now = DateTime.UtcNow;
        var today = new DateTime(now.Year, now.Month, now.Day, 0, 0, 0, DateTimeKind.Utc);
        var windowStart = today.AddDays(-(request.Days - 1));
        var prevWindowStart = today.AddDays(-(request.Days * 2 - 1));
        var sparkStart = today.AddDays(-(SparkDays - 1));

        // ── 1. Pull raw data (small dataset; in-memory aggregation is fine) ──
        var cvs = await db.CVs
            .Select(c => new { c.CreatedAt, c.Company, c.UserId })
            .ToListAsync(ct);

        var pdfs = await db.PdfDownloads
            .Select(p => new { p.GeneratedAt, p.ThemeKey, p.UserId, p.CvId })
            .ToListAsync(ct);

        var totalUsers = await userQueries.TotalUsersAsync(null, ct);
        var totalUsersAtPrev = await userQueries.TotalUsersAsync(today.AddDays(-request.Days), ct);
        var recentUsers = await userQueries.RecentUsersAsync(ActivityLimit, ct);
        var newUsersInSparkWindow = await userQueries.NewUsersSinceAsync(sparkStart, ct);
        var newUsersInWindow = await userQueries.NewUsersSinceAsync(windowStart, ct);

        // ── 2. KPIs ────────────────────────────────────────────────────────────
        var totalCvs = cvs.Count;
        var totalCvsAtPrev = cvs.Count(c => c.CreatedAt < today.AddDays(-request.Days));
        var totalPdfs = pdfs.Count;
        var totalPdfsAtPrev = pdfs.Count(p => p.GeneratedAt < today.AddDays(-request.Days));

        var avgCvsPerUser = totalUsers > 0 ? (double)totalCvs / totalUsers : 0;
        var avgCvsPerUserPrev = totalUsersAtPrev > 0 ? (double)totalCvsAtPrev / totalUsersAtPrev : 0;

        var userSpark = DailyBuckets(newUsersInSparkWindow.Select(u => u.CreatedAt), sparkStart, SparkDays)
            .Select(p => p.Value).ToList();
        var cvSpark = DailyBuckets(cvs.Select(c => c.CreatedAt), sparkStart, SparkDays)
            .Select(p => p.Value).ToList();
        var pdfSpark = DailyBuckets(pdfs.Select(p => p.GeneratedAt), sparkStart, SparkDays)
            .Select(p => p.Value).ToList();

        var kpis = new KpisDto(
            TotalUsers: new KpiDto(totalUsers, totalUsersAtPrev, userSpark),
            TotalCvs: new KpiDto(totalCvs, totalCvsAtPrev, cvSpark),
            PdfDownloads: new KpiDto(totalPdfs, totalPdfsAtPrev, pdfSpark),
            AvgCvsPerUser: new KpiDto(avgCvsPerUser, avgCvsPerUserPrev, [])
        );

        // ── 3. CV creation buckets ─────────────────────────────────────────────
        var cvCreatedAts = cvs.Select(c => c.CreatedAt).ToList();
        var cvsCreated = new CvsCreatedDto(
            Daily: DailyBuckets(cvCreatedAts, windowStart, request.Days),
            Weekly: WeeklyBucketsFrom(cvCreatedAts, today, WeeklyBuckets),
            Monthly: MonthlyBucketsFrom(cvCreatedAts, today, MonthlyBuckets)
        );

        // ── 4. User growth (cumulative) ───────────────────────────────────────
        var startingUsers = totalUsersAtPrev; // users that existed before the window
        var dailyNew = DailyBuckets(newUsersInWindow.Select(u => u.CreatedAt), windowStart, request.Days);
        var userGrowth = new List<TimePointDto>(dailyNew.Count);
        var running = startingUsers;
        foreach (var p in dailyNew)
        {
            running += p.Value;
            userGrowth.Add(new TimePointDto(p.Date, running));
        }

        // ── 5. Theme usage (only from real PDF exports — see ADR 0001) ────────
        var themeMeta = new (string Key, string Label, string Swatch)[]
        {
            ("burgundy", "Burgundy", "#B5213F"),
            ("nordic",   "Nordic",   "#1E3A5F"),
            ("charcoal", "Charcoal", "#0D1117"),
        };
        var themeCounts = pdfs.GroupBy(p => p.ThemeKey)
            .ToDictionary(g => g.Key, g => g.Count(), StringComparer.OrdinalIgnoreCase);
        var themeUsage = themeMeta
            .Select(t => new ThemeUsageDto(t.Key, t.Label, themeCounts.GetValueOrDefault(t.Key, 0), t.Swatch))
            .ToList();

        // ── 6. Top companies ──────────────────────────────────────────────────
        var topCompanies = cvs
            .Where(c => !string.IsNullOrWhiteSpace(c.Company))
            .GroupBy(c => c.Company.Trim())
            .Select(g => new TopCompanyDto(g.Key, g.Count()))
            .OrderByDescending(c => c.Count)
            .ThenBy(c => c.Name)
            .Take(TopCompaniesLimit)
            .ToList();

        // ── 7. Activity feed (UNION of recent rows) ───────────────────────────
        var allUserIds = cvs.Select(c => c.UserId).Concat(pdfs.Select(p => p.UserId)).Distinct().ToList();
        var emailById = await userQueries.EmailsByUserIdAsync(allUserIds, ct);

        var activity = new List<ActivityEventDto>();
        foreach (var u in recentUsers)
            activity.Add(new ActivityEventDto("register", u.Email, RelativeTime(u.CreatedAt, now), null, u.CreatedAt));
        foreach (var c in cvs.OrderByDescending(c => c.CreatedAt).Take(ActivityLimit))
        {
            var email = emailById.GetValueOrDefault(c.UserId, "unknown");
            activity.Add(new ActivityEventDto("cv", email, RelativeTime(c.CreatedAt, now),
                $"{c.Company}", c.CreatedAt));
        }
        foreach (var p in pdfs.OrderByDescending(p => p.GeneratedAt).Take(ActivityLimit))
        {
            var email = emailById.GetValueOrDefault(p.UserId, "unknown");
            activity.Add(new ActivityEventDto("pdf", email, RelativeTime(p.GeneratedAt, now),
                CapitalizeTheme(p.ThemeKey), p.GeneratedAt));
        }
        var activityFeed = activity.OrderByDescending(a => a.At).Take(ActivityLimit).ToList();

        // ── 8. Pricing readiness ──────────────────────────────────────────────
        var usersWithAtLeastOneCv = cvs.Select(c => c.UserId).Distinct().Count();
        var cvsByUser = cvs.GroupBy(c => c.UserId).Select(g => g.Count()).ToList();
        var usersWithTwoPlusCvs = cvsByUser.Count(n => n >= 2);

        var activationRate = totalUsers > 0 ? (double)usersWithAtLeastOneCv / totalUsers : 0;
        var repeatRate = totalUsers > 0 ? (double)usersWithTwoPlusCvs / totalUsers : 0;
        var weeklyUserGrowth = newUsersInWindow.Count(u => u.CreatedAt >= today.AddDays(-6));

        var projectedWeeks = totalUsers >= PricingTargetUsers
            ? 0
            : (int)Math.Ceiling((double)(PricingTargetUsers - totalUsers) / Math.Max(weeklyUserGrowth, 1));
        var projectedDate = today.AddDays(projectedWeeks * 7);

        var criteria = new List<CriterionDto>
        {
            new($"{ActiveUsersThreshold}+ active users",       totalUsers >= ActiveUsersThreshold,            $"{totalUsers}"),
            new("Activation rate > 30%",                       activationRate > ActivationRateThreshold,      $"{Math.Round(activationRate * 100)}%"),
            new("Repeat-creation > 30%",                       repeatRate > RepeatRateThreshold,              $"{Math.Round(repeatRate * 100)}%"),
            new($"Weekly growth > {WeeklyGrowthThreshold} users", weeklyUserGrowth > WeeklyGrowthThreshold,   $"{weeklyUserGrowth} / wk"),
            new("Median 2+ CVs per user",                      avgCvsPerUser >= AvgCvsThreshold,              avgCvsPerUser.ToString("0.00")),
        };
        var score = (int)Math.Round(criteria.Count(c => c.Met) / (double)criteria.Count * 100);
        var verdict = score switch
        {
            >= 80 => new VerdictDto("Ship pricing now", "emerald",
                "Your funnel is sticky and growing. Roll out a paid plan this sprint."),
            >= 60 => new VerdictDto("Almost there", "amber",
                "Close to monetization readiness. Tighten one or two criteria and you're set."),
            _     => new VerdictDto("Keep growing", "rose",
                "Focus on activation and repeat usage before introducing pricing."),
        };

        var pricing = new PricingReadinessDto(
            TargetUsers: PricingTargetUsers,
            CurrentUsers: totalUsers,
            WeeklyUserGrowth: weeklyUserGrowth,
            ProjectedWeeksToTarget: projectedWeeks,
            ProjectedDate: projectedDate,
            ActivationRate: activationRate,
            RepeatRate: repeatRate,
            AvgCvsPerUser: avgCvsPerUser,
            Score: score,
            Verdict: verdict,
            Criteria: criteria
        );

        return new AdminStatsDto(
            GeneratedAt: now,
            Kpis: kpis,
            CvsCreated: cvsCreated,
            UserGrowth: userGrowth,
            ThemeUsage: themeUsage,
            TopCompanies: topCompanies,
            Activity: activityFeed,
            Pricing: pricing
        );
    }

    // ── Bucket helpers (UTC, zero-filled) ─────────────────────────────────────

    private static List<TimePointDto> DailyBuckets(IEnumerable<DateTime> timestamps, DateTime startDay, int days)
    {
        var counts = new int[days];
        foreach (var t in timestamps)
        {
            var day = new DateTime(t.Year, t.Month, t.Day, 0, 0, 0, DateTimeKind.Utc);
            var idx = (int)(day - startDay).TotalDays;
            if (idx >= 0 && idx < days) counts[idx]++;
        }
        var result = new List<TimePointDto>(days);
        for (var i = 0; i < days; i++)
            result.Add(new TimePointDto(startDay.AddDays(i), counts[i]));
        return result;
    }

    private static List<TimePointDto> WeeklyBucketsFrom(IEnumerable<DateTime> timestamps, DateTime today, int weeks)
    {
        // Week starts on Monday (ISO). Most-recent bucket includes today.
        var thisWeekStart = today.AddDays(-((int)today.DayOfWeek == 0 ? 6 : (int)today.DayOfWeek - 1));
        var firstWeekStart = thisWeekStart.AddDays(-7 * (weeks - 1));
        var counts = new int[weeks];
        foreach (var t in timestamps)
        {
            var weekIdx = (int)Math.Floor((t.Date - firstWeekStart).TotalDays / 7.0);
            if (weekIdx >= 0 && weekIdx < weeks) counts[weekIdx]++;
        }
        var result = new List<TimePointDto>(weeks);
        for (var i = 0; i < weeks; i++)
            result.Add(new TimePointDto(firstWeekStart.AddDays(i * 7), counts[i]));
        return result;
    }

    private static List<TimePointDto> MonthlyBucketsFrom(IEnumerable<DateTime> timestamps, DateTime today, int months)
    {
        var thisMonthStart = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc);
        var firstMonthStart = thisMonthStart.AddMonths(-(months - 1));
        var counts = new int[months];
        foreach (var t in timestamps)
        {
            var idx = ((t.Year - firstMonthStart.Year) * 12) + (t.Month - firstMonthStart.Month);
            if (idx >= 0 && idx < months) counts[idx]++;
        }
        var result = new List<TimePointDto>(months);
        for (var i = 0; i < months; i++)
            result.Add(new TimePointDto(firstMonthStart.AddMonths(i), counts[i]));
        return result;
    }

    private static string RelativeTime(DateTime at, DateTime now)
    {
        var delta = now - at;
        if (delta.TotalSeconds < 60) return "just now";
        if (delta.TotalMinutes < 60) return $"{(int)delta.TotalMinutes} min ago";
        if (delta.TotalHours < 24) return $"{(int)delta.TotalHours} h ago";
        if (delta.TotalDays < 7) return $"{(int)delta.TotalDays} d ago";
        if (delta.TotalDays < 30) return $"{(int)(delta.TotalDays / 7)} w ago";
        return at.ToString("MMM d, yyyy");
    }

    private static string CapitalizeTheme(string key) =>
        key.Length == 0 ? key : char.ToUpperInvariant(key[0]) + key[1..];
}
