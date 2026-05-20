namespace CVCreator.Domain.Services;

public static class CVNameGenerator
{
    public static string Generate(string firstName, string lastName, string company, string language)
        => $"{firstName} {lastName}, {company}, {language}";
}
