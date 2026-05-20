namespace CVCreator.Domain.Entities;

public class Certification
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = null!;
    public string? NameSv { get; set; }
    public string? NameEn { get; set; }
    public int Year { get; set; }
    public string? Link { get; set; }
}
