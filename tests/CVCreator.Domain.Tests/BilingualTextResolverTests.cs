using CVCreator.Domain.Services;
using FluentAssertions;

namespace CVCreator.Domain.Tests;

public class BilingualTextResolverTests
{
    [Fact]
    public void Resolve_TargetSv_SvHasValue_ReturnsSvNoFallback()
    {
        var result = BilingualTextResolver.Resolve("Hej", "Hello", "SV");
        result.Text.Should().Be("Hej");
        result.FallbackUsed.Should().BeFalse();
    }

    [Fact]
    public void Resolve_TargetEn_EnHasValue_ReturnsEnNoFallback()
    {
        var result = BilingualTextResolver.Resolve("Hej", "Hello", "EN");
        result.Text.Should().Be("Hello");
        result.FallbackUsed.Should().BeFalse();
    }

    [Fact]
    public void Resolve_TargetSv_SvEmpty_EnHasValue_ReturnsFallback()
    {
        var result = BilingualTextResolver.Resolve(null, "Hello", "SV");
        result.Text.Should().Be("Hello");
        result.FallbackUsed.Should().BeTrue();
    }

    [Fact]
    public void Resolve_TargetEn_EnEmpty_SvHasValue_ReturnsFallback()
    {
        var result = BilingualTextResolver.Resolve("Hej", null, "EN");
        result.Text.Should().Be("Hej");
        result.FallbackUsed.Should().BeTrue();
    }

    [Fact]
    public void Resolve_TargetSv_BothNull_ReturnsEmptyNoFallback()
    {
        var result = BilingualTextResolver.Resolve(null, null, "SV");
        result.Text.Should().Be("");
        result.FallbackUsed.Should().BeFalse();
    }

    [Fact]
    public void Resolve_TargetEn_BothNull_ReturnsEmptyNoFallback()
    {
        var result = BilingualTextResolver.Resolve(null, null, "EN");
        result.Text.Should().Be("");
        result.FallbackUsed.Should().BeFalse();
    }

    [Fact]
    public void Resolve_WhitespaceOnly_TreatedAsEmpty_FallsBack()
    {
        var result = BilingualTextResolver.Resolve("   ", "Hello", "SV");
        result.Text.Should().Be("Hello");
        result.FallbackUsed.Should().BeTrue();
    }
}
