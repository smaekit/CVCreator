namespace CVCreator.Application.Admin.GetAdminStats;

public record AdminStatsDto(
    DateTime GeneratedAt,
    KpisDto Kpis,
    CvsCreatedDto CvsCreated,
    IReadOnlyList<TimePointDto> UserGrowth,
    IReadOnlyList<ThemeUsageDto> ThemeUsage,
    IReadOnlyList<TopCompanyDto> TopCompanies,
    IReadOnlyList<ActivityEventDto> Activity,
    PricingReadinessDto Pricing
);

public record KpisDto(
    KpiDto TotalUsers,
    KpiDto TotalCvs,
    KpiDto PdfDownloads,
    KpiDto AvgCvsPerUser
);

public record KpiDto(double Value, double Prev, IReadOnlyList<int> Spark);

public record TimePointDto(DateTime Date, int Value);

public record CvsCreatedDto(
    IReadOnlyList<TimePointDto> Daily,
    IReadOnlyList<TimePointDto> Weekly,
    IReadOnlyList<TimePointDto> Monthly
);

public record ThemeUsageDto(string Key, string Label, int Count, string Swatch);

public record TopCompanyDto(string Name, int Count);

public record ActivityEventDto(string Type, string Who, string When, string? Meta, DateTime At);

public record PricingReadinessDto(
    int TargetUsers,
    int CurrentUsers,
    int WeeklyUserGrowth,
    int ProjectedWeeksToTarget,
    DateTime ProjectedDate,
    double ActivationRate,
    double RepeatRate,
    double AvgCvsPerUser,
    int Score,
    VerdictDto Verdict,
    IReadOnlyList<CriterionDto> Criteria
);

public record VerdictDto(string Label, string Tone, string Body);

public record CriterionDto(string Label, bool Met, string Value);
