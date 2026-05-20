namespace CVCreator.Domain.Entities;

public class Language
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = null!;
    public string Name { get; set; } = "";
    public string Proficiency { get; set; } = ""; // Native | Fluent | Professional | Basic
}
