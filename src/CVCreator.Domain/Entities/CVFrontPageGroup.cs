namespace CVCreator.Domain.Entities;

public class CVFrontPageGroup
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid CVId { get; set; }
    public CV CV { get; set; } = null!;
    public string? HeaderSv { get; set; }
    public string? HeaderEn { get; set; }
    public int DisplayOrder { get; set; }
    public List<CVFrontPageGroupItem> Items { get; set; } = [];
}

public class CVFrontPageGroupItem
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid GroupId { get; set; }
    public CVFrontPageGroup Group { get; set; } = null!;
    public Guid? SkillId { get; set; }
    public Guid? CertificationId { get; set; }
    public int DisplayOrder { get; set; }
}
