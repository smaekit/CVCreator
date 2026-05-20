using System.Net;
using System.Net.Http.Json;
using CVCreator.Integration.Tests.Fixtures;
using FluentAssertions;

namespace CVCreator.Integration.Tests.Profile;

public class CertificationsEndpointTests(IntegrationTestFixture fixture)
    : IClassFixture<IntegrationTestFixture>
{
    [Fact]
    public async Task CreateAndGetCertification_Works()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var createRes = await client.PostAsJsonAsync("/api/profile/certifications", new
        {
            NameSv = "Azure-certifikat", NameEn = "Azure Certification",
            Year = 2023, Link = "https://learn.microsoft.com"
        });
        createRes.StatusCode.Should().Be(HttpStatusCode.Created);

        var listRes = await client.GetAsync("/api/profile/certifications");
        var list = await listRes.Content.ReadFromJsonAsync<List<CertResponse>>();
        list!.Should().ContainSingle(c => c.NameEn == "Azure Certification" && c.Year == 2023);
    }

    [Fact]
    public async Task DeleteCertification_Returns204()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();
        var createRes = await client.PostAsJsonAsync("/api/profile/certifications",
            new { NameSv = (string?)null, NameEn = "AZ-900", Year = 2022 });
        var created = await createRes.Content.ReadFromJsonAsync<CertResponse>();

        var deleteRes = await client.DeleteAsync($"/api/profile/certifications/{created!.Id}");
        deleteRes.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    private record CertResponse(Guid Id, string? NameSv, string? NameEn, int Year, string? Link);
}
