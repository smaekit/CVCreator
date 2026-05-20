namespace CVCreator.Domain.Services;

public static class BilingualTextResolver
{
    public static BilingualResult Resolve(string? textSv, string? textEn, string target)
    {
        var primary = target == "SV" ? textSv : textEn;
        var fallback = target == "SV" ? textEn : textSv;

        if (!string.IsNullOrWhiteSpace(primary))
            return new BilingualResult(primary, false);

        if (!string.IsNullOrWhiteSpace(fallback))
            return new BilingualResult(fallback, true);

        return new BilingualResult("", false);
    }
}

public record BilingualResult(string Text, bool FallbackUsed);
