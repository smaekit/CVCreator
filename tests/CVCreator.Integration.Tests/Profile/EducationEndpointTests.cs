using System.Net;
using System.Net.Http.Json;
using CVCreator.Integration.Tests.Fixtures;
using FluentAssertions;

namespace CVCreator.Integration.Tests.Profile;

public class EducationEndpointTests(IntegrationTestFixture fixture)
    : IClassFixture<IntegrationTestFixture>
{
    [Fact]
    public async Task CreateAndGetEducation_Works()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var createRes = await client.PostAsJsonAsync("/api/profile/education", new
        {
            DegreeSv = "Civilingenjör", DegreeEn = "Master of Science",
            School = "KTH", StartYear = 2015, EndYear = 2020
        });
        createRes.StatusCode.Should().Be(HttpStatusCode.Created);

        var listRes = await client.GetAsync("/api/profile/education");
        var list = await listRes.Content.ReadFromJsonAsync<List<EducationResponse>>();
        list!.Should().ContainSingle(e => e.School == "KTH" && e.DegreeEn == "Master of Science");
    }

    [Fact]
    public async Task DeleteEducation_Returns204()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();
        var createRes = await client.PostAsJsonAsync("/api/profile/education",
            new { DegreeSv = (string?)null, DegreeEn = (string?)null, School = "HiG", StartYear = 2010 });
        var created = await createRes.Content.ReadFromJsonAsync<EducationResponse>();

        var deleteRes = await client.DeleteAsync($"/api/profile/education/{created!.Id}");
        deleteRes.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    private record EducationResponse(Guid Id, string? DegreeSv, string? DegreeEn, string School, int StartYear, int? EndYear);
}
