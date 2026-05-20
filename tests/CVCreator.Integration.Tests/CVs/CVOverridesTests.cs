using System.Net;
using System.Net.Http.Json;
using CVCreator.Integration.Tests.Fixtures;
using FluentAssertions;

namespace CVCreator.Integration.Tests.CVs;

public class CVOverridesTests(IntegrationTestFixture fixture)
    : IClassFixture<IntegrationTestFixture>
{
    [Fact]
    public async Task IntroductionOverride_WinsOverProfileIntro()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();
        await client.PutAsJsonAsync("/api/profile", new
        {
            FirstName = "Alice", LastName = "Smith",
            IntroductionEn = "Profile introduction"
        });
        var cvRes = await client.PostAsJsonAsync("/api/cvs", new { Company = "Acme", Language = "EN" });
        var cv = await cvRes.Content.ReadFromJsonAsync<CvRef>();

        await client.PutAsJsonAsync($"/api/cvs/{cv!.Id}/overrides",
            new { IntroductionOverride = "Tailored intro for Acme", YearsOfExperience = "10+ years" });

        var getRes = await client.GetAsync($"/api/cvs/{cv.Id}");
        var body = await getRes.Content.ReadFromJsonAsync<ResolvedCvIntroResponse>();

        body!.Introduction.Text.Should().Be("Tailored intro for Acme");
        body.IsIntroductionOverridden.Should().BeTrue();
        body.YearsOfExperience.Should().Be("10+ years");
    }

    [Fact]
    public async Task ClearingOverride_RevertsToprofileIntro()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();
        await client.PutAsJsonAsync("/api/profile", new
        {
            FirstName = "Bob", LastName = "Jones",
            IntroductionEn = "Original profile intro"
        });
        var cvRes = await client.PostAsJsonAsync("/api/cvs", new { Company = "Co", Language = "EN" });
        var cv = await cvRes.Content.ReadFromJsonAsync<CvRef>();

        await client.PutAsJsonAsync($"/api/cvs/{cv!.Id}/overrides",
            new { IntroductionOverride = "Override", YearsOfExperience = (string?)null });
        await client.PutAsJsonAsync($"/api/cvs/{cv.Id}/overrides",
            new { IntroductionOverride = (string?)null, YearsOfExperience = (string?)null });

        var getRes = await client.GetAsync($"/api/cvs/{cv.Id}");
        var body = await getRes.Content.ReadFromJsonAsync<ResolvedCvIntroResponse>();

        body!.Introduction.Text.Should().Be("Original profile intro");
        body.IsIntroductionOverridden.Should().BeFalse();
    }

    private record CvRef(Guid Id);
    private record ResolvedCvIntroResponse(
        IntroResponse Introduction, bool IsIntroductionOverridden, string? YearsOfExperience);
    private record IntroResponse(string Text, bool FallbackUsed);
}
