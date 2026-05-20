namespace CVCreator.Domain.Entities;

public class CV
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = null!;
    public string Company { get; set; } = "";
    public string Language { get; set; } = "SV"; // SV | EN
    public string Name { get; set; } = "";
    public string? IntroductionOverride { get; set; }
    public string? YearsOfExperience { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
