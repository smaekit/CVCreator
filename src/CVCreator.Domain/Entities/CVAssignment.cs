namespace CVCreator.Domain.Entities;

public class CVAssignment
{
    public Guid CVId { get; set; }
    public CV CV { get; set; } = null!;
    public Guid AssignmentId { get; set; }
    public Assignment Assignment { get; set; } = null!;
    public bool IsHighlighted { get; set; }
    public string? DescriptionOverride { get; set; }
    public int DisplayOrder { get; set; }
}

public class CVSkill
{
    public Guid CVId { get; set; }
    public Guid SkillId { get; set; }
    public int DisplayOrder { get; set; }
}

public class CVEducation
{
    public Guid CVId { get; set; }
    public Guid EducationId { get; set; }
    public int DisplayOrder { get; set; }
}

public class CVCertification
{
    public Guid CVId { get; set; }
    public Guid CertificationId { get; set; }
    public int DisplayOrder { get; set; }
}

public class CVLanguage
{
    public Guid CVId { get; set; }
    public Guid LanguageId { get; set; }
    public int DisplayOrder { get; set; }
}
