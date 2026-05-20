namespace CVCreator.Application.Common.Interfaces;

public interface IAiTextService
{
    IAsyncEnumerable<string> StreamImprove(string text, string language, CancellationToken ct = default);
    IAsyncEnumerable<string> StreamTranslate(string text, string fromLanguage, CancellationToken ct = default);
}
