namespace CVCreator.Domain.Entities;

public class Skill
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = null!;
    public string Name { get; set; } = "";
    public string? Category { get; set; }
}
