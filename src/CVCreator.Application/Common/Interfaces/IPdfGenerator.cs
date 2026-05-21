namespace CVCreator.Application.Common.Interfaces;

public interface IPdfGenerator
{
    Task<byte[]> GenerateAsync(Guid cvId, string previewToken, string? theme = null, CancellationToken ct = default);
}
