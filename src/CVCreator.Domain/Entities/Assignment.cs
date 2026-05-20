namespace CVCreator.Domain.Entities;

public class Assignment
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = null!;
    public string? TitleSv { get; set; }
    public string? TitleEn { get; set; }
    public string? DescriptionSv { get; set; }
    public string? DescriptionEn { get; set; }
    public string Client { get; set; } = "";
    public DateOnly StartDate { get; set; }
    public DateOnly? EndDate { get; set; }
    public List<AssignmentSkill> AssignmentSkills { get; set; } = [];
}

public class AssignmentSkill
{
    public Guid AssignmentId { get; set; }
    public Assignment Assignment { get; set; } = null!;
    public Guid SkillId { get; set; }
    public Skill Skill { get; set; } = null!;
}
