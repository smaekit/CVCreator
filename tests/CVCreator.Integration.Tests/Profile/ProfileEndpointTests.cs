using System.Net;
using System.Net.Http.Json;
using CVCreator.Integration.Tests.Fixtures;
using FluentAssertions;

namespace CVCreator.Integration.Tests.Profile;

public class ProfileEndpointTests(IntegrationTestFixture fixture)
    : IClassFixture<IntegrationTestFixture>
{
    [Fact]
    public async Task GetProfile_BeforeAnyUpsert_Returns404()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var response = await client.GetAsync("/api/profile");

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task UpsertProfile_WithValidNames_Returns200AndSavesData()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        var response = await client.PutAsJsonAsync("/api/profile",
            new { FirstName = "Alice", LastName = "Smith" });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<ProfileResponse>();
        body!.FirstName.Should().Be("Alice");
        body.LastName.Should().Be("Smith");
    }

    [Fact]
    public async Task GetProfile_AfterUpsert_ReturnsUpdatedData()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();
        await client.PutAsJsonAsync("/api/profile", new { FirstName = "Bob", LastName = "Jones" });

        var response = await client.GetAsync("/api/profile");
        var body = await response.Content.ReadFromJsonAsync<ProfileResponse>();

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        body!.FirstName.Should().Be("Bob");
        body.LastName.Should().Be("Jones");
    }

    [Fact]
    public async Task UploadPicture_WithValidFile_ReturnsBlobUrl()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();
        using var content = new MultipartFormDataContent();
        var fileBytes = "fake-image-content"u8.ToArray();
        content.Add(new ByteArrayContent(fileBytes) { Headers = { ContentType = new("image/jpeg") } },
            "file", "photo.jpg");

        var response = await client.PostAsync("/api/profile/picture", content);

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<PictureResponse>();
        body!.Url.Should().StartWith("https://");
    }

    private record ProfileResponse(string FirstName, string LastName, string? PictureUrl);
    private record PictureResponse(string Url);
}
