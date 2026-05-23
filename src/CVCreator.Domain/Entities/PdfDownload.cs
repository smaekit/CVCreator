namespace CVCreator.Domain.Entities;

public class PdfDownload
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public string UserId { get; set; } = null!;
    public Guid CvId { get; set; }
    public string ThemeKey { get; set; } = "burgundy";
    public DateTime GeneratedAt { get; set; } = DateTime.UtcNow;
}
