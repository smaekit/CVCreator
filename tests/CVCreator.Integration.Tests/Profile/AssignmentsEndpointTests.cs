using System.Net;
using System.Net.Http.Json;
using CVCreator.Integration.Tests.Fixtures;
using FluentAssertions;

namespace CVCreator.Integration.Tests.Profile;

public class AssignmentsEndpointTests(IntegrationTestFixture fixture)
    : IClassFixture<IntegrationTestFixture>
{
    [Fact]
    public async Task CreateAssignment_ReturnsCreatedAssignment()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/profile/assignments", new
        {
            TitleSv = "Konsult", TitleEn = "Consultant",
            DescriptionSv = "Jobbade med .NET", DescriptionEn = "Worked with .NET",
            Client = "Acme Corp",
            StartDate = "2023-01-01",
            EndDate = (string?)null
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<AssignmentResponse>();
        body!.TitleEn.Should().Be("Consultant");
        body.Client.Should().Be("Acme Corp");
        body.EndDate.Should().BeNull();
    }

    [Fact]
    public async Task GetAssignments_ReturnsChronologicalList()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();
        await client.PostAsJsonAsync("/api/profile/assignments",
            new { TitleSv = "Äldre", TitleEn = "Older", Client = "X", StartDate = "2020-01-01" });
        await client.PostAsJsonAsync("/api/profile/assignments",
            new { TitleSv = "Nyare", TitleEn = "Newer", Client = "Y", StartDate = "2022-06-01" });

        var response = await client.GetAsync("/api/profile/assignments");
        var list = await response.Content.ReadFromJsonAsync<List<AssignmentResponse>>();

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        list!.Should().HaveCount(2);
        string.Compare(list[0].StartDate, list[1].StartDate, StringComparison.Ordinal).Should().BePositive();
    }

    [Fact]
    public async Task AttachSkillToAssignment_SkillAppearsInAssignmentSkills()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();
        var skillRes = await client.PostAsJsonAsync("/api/profile/skills", new { Name = "EF Core", Category = "Backend" });
        var skill = await skillRes.Content.ReadFromJsonAsync<SkillRef>();

        var aRes = await client.PostAsJsonAsync("/api/profile/assignments",
            new { TitleEn = "Dev", Client = "Z", StartDate = "2021-01-01" });
        var assignment = await aRes.Content.ReadFromJsonAsync<AssignmentResponse>();

        var attachRes = await client.PostAsJsonAsync(
            $"/api/profile/assignments/{assignment!.Id}/skills/{skill!.Id}", new { });

        attachRes.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var getRes = await client.GetAsync($"/api/profile/assignments/{assignment.Id}");
        var body = await getRes.Content.ReadFromJsonAsync<AssignmentResponse>();
        body!.SkillIds.Should().Contain(skill.Id);
    }

    [Fact]
    public async Task DeleteAssignment_Returns204()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();
        var createRes = await client.PostAsJsonAsync("/api/profile/assignments",
            new { TitleEn = "ToDelete", Client = "Del", StartDate = "2022-01-01" });
        var created = await createRes.Content.ReadFromJsonAsync<AssignmentResponse>();

        var deleteRes = await client.DeleteAsync($"/api/profile/assignments/{created!.Id}");
        deleteRes.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    private record AssignmentResponse(
        Guid Id, string? TitleSv, string? TitleEn,
        string? DescriptionSv, string? DescriptionEn,
        string Client, string StartDate, string? EndDate,
        List<Guid> SkillIds);

    private record SkillRef(Guid Id, string Name, string? Category);
}
