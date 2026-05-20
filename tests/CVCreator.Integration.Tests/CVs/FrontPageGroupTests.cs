using System.Net;
using System.Net.Http.Json;
using CVCreator.Integration.Tests.Fixtures;
using FluentAssertions;

namespace CVCreator.Integration.Tests.CVs;

public class FrontPageGroupTests(IntegrationTestFixture fixture)
    : IClassFixture<IntegrationTestFixture>
{
    [Fact]
    public async Task CreateAndGetFrontPageGroup_Works()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();
        var cvRes = await client.PostAsJsonAsync("/api/cvs", new { Company = "Acme", Language = "EN" });
        var cv = await cvRes.Content.ReadFromJsonAsync<CvRef>();

        var createRes = await client.PostAsJsonAsync($"/api/cvs/{cv!.Id}/front-page-groups",
            new { HeaderSv = "Molnkunskaper", HeaderEn = "Cloud Skills", DisplayOrder = 0 });

        createRes.StatusCode.Should().Be(HttpStatusCode.Created);

        var listRes = await client.GetAsync($"/api/cvs/{cv.Id}/front-page-groups");
        var list = await listRes.Content.ReadFromJsonAsync<List<GroupResponse>>();
        list!.Should().ContainSingle(g => g.HeaderEn == "Cloud Skills");
    }

    [Fact]
    public async Task UpdateSelections_ThirdHighlightedAssignment_Returns500()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();
        var a1 = await CreateAssignment(client, "Assign1");
        var a2 = await CreateAssignment(client, "Assign2");
        var a3 = await CreateAssignment(client, "Assign3");
        var cvRes = await client.PostAsJsonAsync("/api/cvs", new { Company = "Co", Language = "EN" });
        var cv = await cvRes.Content.ReadFromJsonAsync<CvRef>();

        var response = await client.PutAsJsonAsync($"/api/cvs/{cv!.Id}/selections", new
        {
            Assignments = new[]
            {
                new { Id = a1, DisplayOrder = 0, IsHighlighted = true },
                new { Id = a2, DisplayOrder = 1, IsHighlighted = true },
                new { Id = a3, DisplayOrder = 2, IsHighlighted = true }
            },
            Skills = Array.Empty<object>(),
            Educations = Array.Empty<object>(),
            Certifications = Array.Empty<object>(),
            Languages = Array.Empty<object>()
        });

        response.StatusCode.Should().Be(HttpStatusCode.InternalServerError);
    }

    private async Task<Guid> CreateAssignment(System.Net.Http.HttpClient client, string title)
    {
        var res = await client.PostAsJsonAsync("/api/profile/assignments",
            new { TitleEn = title, Client = "C", StartDate = "2022-01-01" });
        var a = await res.Content.ReadFromJsonAsync<AssignmentRef>();
        return a!.Id;
    }

    private record CvRef(Guid Id);
    private record GroupResponse(Guid Id, string? HeaderSv, string? HeaderEn, int DisplayOrder);
    private record AssignmentRef(Guid Id);
}
