using CVCreator.Domain.Services;
using FluentAssertions;

namespace CVCreator.Domain.Tests;

public class CVNameGeneratorTests
{
    [Fact]
    public void Generate_SvLanguage_FormatsCorrectly()
    {
        var name = CVNameGenerator.Generate("Alice", "Smith", "Acme", "SV");
        name.Should().Be("Alice Smith, Acme, SV");
    }

    [Fact]
    public void Generate_EnLanguage_FormatsCorrectly()
    {
        var name = CVNameGenerator.Generate("Bob", "Jones", "TechCorp", "EN");
        name.Should().Be("Bob Jones, TechCorp, EN");
    }
}
