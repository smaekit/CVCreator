namespace CVCreator.Domain.ViewModels;

public record ResolvedCv(
    string FirstName,
    string LastName,
    string? PictureUrl,
    ResolvedText Introduction,
    bool IsIntroductionOverridden,
    List<ResolvedAssignment> Assignments,
    List<ResolvedSkill> Skills,
    List<ResolvedEducation> Educations,
    List<ResolvedCertification> Certifications,
    List<ResolvedLanguage> Languages,
    string Language,
    string? YearsOfExperience
)
{
    public List<ResolvedFrontPageGroup> FrontPageGroups { get; init; } = [];
}

public record ResolvedFrontPageGroup(
    Guid Id,
    string Header,
    bool HeaderFallbackUsed,
    int DisplayOrder,
    List<ResolvedFrontPageGroupItem> Items
);

public record ResolvedFrontPageGroupItem(Guid Id, string Label, int DisplayOrder);

public record ResolvedText(string Text, bool FallbackUsed);

public record ResolvedAssignment(
    Guid Id,
    ResolvedText Title,
    ResolvedText Description,
    string Client,
    string StartDate,
    string? EndDate,
    bool IsHighlighted,
    int DisplayOrder,
    bool IsDescriptionOverridden
);

public record ResolvedSkill(Guid Id, string Name, string? Category, int DisplayOrder);

public record ResolvedEducation(
    Guid Id,
    ResolvedText Degree,
    string School,
    int StartYear,
    int? EndYear,
    int DisplayOrder
);

public record ResolvedCertification(
    Guid Id,
    ResolvedText Name,
    int Year,
    string? Link,
    int DisplayOrder
);

public record ResolvedLanguage(Guid Id, string Name, string Proficiency, int DisplayOrder);
