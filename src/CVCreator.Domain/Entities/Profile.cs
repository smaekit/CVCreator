namespace CVCreator.Domain.Entities;

public class Profile
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = null!;
    public string FirstName { get; set; } = "";
    public string LastName { get; set; } = "";
    public string? PictureUrl { get; set; }
    public string? IntroductionSv { get; set; }
    public string? IntroductionEn { get; set; }
}
