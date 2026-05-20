using System.Net;
using System.Net.Http.Json;
using CVCreator.Integration.Tests.Fixtures;
using FluentAssertions;

namespace CVCreator.Integration.Tests.CVs;

public class CVsEndpointTests(IntegrationTestFixture fixture)
    : IClassFixture<IntegrationTestFixture>
{
    [Fact]
    public async Task CreateCv_ReturnsCreatedCvWithGeneratedName()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();
        await client.PutAsJsonAsync("/api/profile", new { FirstName = "Alice", LastName = "Smith" });

        var response = await client.PostAsJsonAsync("/api/cvs",
            new { Company = "Acme Corp", Language = "SV" });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
        var body = await response.Content.ReadFromJsonAsync<CvResponse>();
        body!.Name.Should().Be("Alice Smith, Acme Corp, SV");
        body.Language.Should().Be("SV");
    }

    [Fact]
    public async Task GetCvs_ReturnsCvsInDescendingCreatedOrder()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();
        await client.PostAsJsonAsync("/api/cvs", new { Company = "First", Language = "EN" });
        await client.PostAsJsonAsync("/api/cvs", new { Company = "Second", Language = "EN" });

        var response = await client.GetAsync("/api/cvs");
        var list = await response.Content.ReadFromJsonAsync<List<CvResponse>>();

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        list!.Should().HaveCount(2);
        list[0].Company.Should().Be("Second");
    }

    [Fact]
    public async Task DeleteCv_Returns204AndCvIsGone()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();
        var createRes = await client.PostAsJsonAsync("/api/cvs",
            new { Company = "ToDelete", Language = "EN" });
        var created = await createRes.Content.ReadFromJsonAsync<CvResponse>();

        var deleteRes = await client.DeleteAsync($"/api/cvs/{created!.Id}");
        var listRes = await client.GetAsync("/api/cvs");
        var list = await listRes.Content.ReadFromJsonAsync<List<CvResponse>>();

        deleteRes.StatusCode.Should().Be(HttpStatusCode.NoContent);
        list!.Should().NotContain(c => c.Id == created.Id);
    }

    private record CvResponse(Guid Id, string Name, string Company, string Language, DateTime CreatedAt);
}
