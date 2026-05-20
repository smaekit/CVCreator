using System.Net;
using System.Net.Http.Json;
using CVCreator.Integration.Tests.Fixtures;
using FluentAssertions;

namespace CVCreator.Integration.Tests.Profile;

public class LanguagesEndpointTests(IntegrationTestFixture fixture)
    : IClassFixture<IntegrationTestFixture>
{
    [Fact]
    public async Task CreateAndGetLanguage_Works()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var createRes = await client.PostAsJsonAsync("/api/profile/languages",
            new { Name = "Swedish", Proficiency = "Native" });
        createRes.StatusCode.Should().Be(HttpStatusCode.Created);

        var listRes = await client.GetAsync("/api/profile/languages");
        var list = await listRes.Content.ReadFromJsonAsync<List<LangResponse>>();
        list!.Should().ContainSingle(l => l.Name == "Swedish" && l.Proficiency == "Native");
    }

    [Fact]
    public async Task DeleteLanguage_Returns204()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();
        var createRes = await client.PostAsJsonAsync("/api/profile/languages",
            new { Name = "English", Proficiency = "Fluent" });
        var created = await createRes.Content.ReadFromJsonAsync<LangResponse>();

        var deleteRes = await client.DeleteAsync($"/api/profile/languages/{created!.Id}");
        deleteRes.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    private record LangResponse(Guid Id, string Name, string Proficiency);
}
