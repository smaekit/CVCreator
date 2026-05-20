using System.Net;
using System.Net.Http.Json;
using CVCreator.Integration.Tests.Fixtures;
using FluentAssertions;

namespace CVCreator.Integration.Tests.Profile;

public class SkillsEndpointTests(IntegrationTestFixture fixture)
    : IClassFixture<IntegrationTestFixture>
{
    [Fact]
    public async Task CreateSkill_ReturnsCreatedSkill()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/profile/skills",
            new { Name = "C#", Category = "Backend" });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<SkillResponse>();
        body!.Name.Should().Be("C#");
        body.Category.Should().Be("Backend");
    }

    [Fact]
    public async Task GetSkills_ReturnsCreatedSkills()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();
        await client.PostAsJsonAsync("/api/profile/skills", new { Name = "Azure", Category = "Cloud" });

        var response = await client.GetAsync("/api/profile/skills");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<List<SkillResponse>>();
        body!.Should().ContainSingle(s => s.Name == "Azure");
    }

    [Fact]
    public async Task UpdateSkill_ChangesName()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();
        var createRes = await client.PostAsJsonAsync("/api/profile/skills",
            new { Name = "React", Category = "Frontend" });
        var created = await createRes.Content.ReadFromJsonAsync<SkillResponse>();

        var response = await client.PutAsJsonAsync($"/api/profile/skills/{created!.Id}",
            new { Name = "React 19", Category = "Frontend" });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<SkillResponse>();
        body!.Name.Should().Be("React 19");
    }

    [Fact]
    public async Task DeleteSkill_Returns204AndSkillIsGone()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();
        var createRes = await client.PostAsJsonAsync("/api/profile/skills",
            new { Name = "ToDelete", Category = (string?)null });
        var created = await createRes.Content.ReadFromJsonAsync<SkillResponse>();

        var deleteRes = await client.DeleteAsync($"/api/profile/skills/{created!.Id}");
        var listRes = await client.GetAsync("/api/profile/skills");
        var list = await listRes.Content.ReadFromJsonAsync<List<SkillResponse>>();

        deleteRes.StatusCode.Should().Be(HttpStatusCode.NoContent);
        list!.Should().NotContain(s => s.Id == created.Id);
    }

    private record SkillResponse(Guid Id, string Name, string? Category);
}
