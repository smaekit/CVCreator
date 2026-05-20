namespace CVCreator.Domain.Entities;

public class Education
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = null!;
    public string? DegreeSv { get; set; }
    public string? DegreeEn { get; set; }
    public string School { get; set; } = "";
    public int StartYear { get; set; }
    public int? EndYear { get; set; }
}
