using System.Net;
using System.Net.Http.Json;
using CVCreator.Integration.Tests.Fixtures;
using FluentAssertions;

namespace CVCreator.Integration.Tests.CVs;

public class CVSelectionsTests(IntegrationTestFixture fixture)
    : IClassFixture<IntegrationTestFixture>
{
    [Fact]
    public async Task GetCv_InitialState_ReturnsEmptySelections()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();
        await client.PutAsJsonAsync("/api/profile", new { FirstName = "Alice", LastName = "Smith" });
        var createRes = await client.PostAsJsonAsync("/api/cvs", new { Company = "Acme", Language = "EN" });
        var cv = await createRes.Content.ReadFromJsonAsync<CvSummary>();

        var getRes = await client.GetAsync($"/api/cvs/{cv!.Id}");
        var body = await getRes.Content.ReadFromJsonAsync<ResolvedCvResponse>();

        getRes.StatusCode.Should().Be(HttpStatusCode.OK);
        body!.Assignments.Should().BeEmpty();
        body.Skills.Should().BeEmpty();
    }

    [Fact]
    public async Task UpdateSelections_SkillAppearsInResolvedCv()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();
        await client.PutAsJsonAsync("/api/profile", new { FirstName = "Bob", LastName = "Jones" });
        var skillRes = await client.PostAsJsonAsync("/api/profile/skills", new { Name = "Docker", Category = "DevOps" });
        var skill = await skillRes.Content.ReadFromJsonAsync<SkillRef>();

        var cvRes = await client.PostAsJsonAsync("/api/cvs", new { Company = "TechCo", Language = "EN" });
        var cv = await cvRes.Content.ReadFromJsonAsync<CvSummary>();

        var putRes = await client.PutAsJsonAsync($"/api/cvs/{cv!.Id}/selections", new
        {
            Assignments = Array.Empty<object>(),
            Skills = new[] { new { Id = skill!.Id, DisplayOrder = 0 } },
            Educations = Array.Empty<object>(),
            Certifications = Array.Empty<object>(),
            Languages = Array.Empty<object>()
        });

        putRes.StatusCode.Should().Be(HttpStatusCode.NoContent);

        var getRes = await client.GetAsync($"/api/cvs/{cv.Id}");
        var body = await getRes.Content.ReadFromJsonAsync<ResolvedCvResponse>();
        body!.Skills.Should().ContainSingle(s => s.Name == "Docker");
    }

    private record CvSummary(Guid Id, string Name, string Company, string Language, DateTime CreatedAt);
    private record ResolvedCvResponse(
        string FirstName, string LastName,
        List<ResolvedAssignment> Assignments,
        List<ResolvedSkill> Skills,
        List<object> Educations,
        List<object> Certifications,
        List<object> Languages);
    private record ResolvedAssignment(Guid Id);
    private record ResolvedSkill(Guid Id, string Name, string? Category, int DisplayOrder);
    private record SkillRef(Guid Id, string Name, string? Category);
}
