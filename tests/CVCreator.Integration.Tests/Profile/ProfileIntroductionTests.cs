using System.Net;
using System.Net.Http.Json;
using CVCreator.Integration.Tests.Fixtures;
using FluentAssertions;

namespace CVCreator.Integration.Tests.Profile;

public class ProfileIntroductionTests(IntegrationTestFixture fixture)
    : IClassFixture<IntegrationTestFixture>
{
    [Fact]
    public async Task UpsertProfile_WithIntroduction_GetReturnsIntroductionFields()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        await client.PutAsJsonAsync("/api/profile", new
        {
            FirstName = "Alice",
            LastName = "Smith",
            IntroductionSv = "Hej, jag är Alice.",
            IntroductionEn = "Hi, I am Alice."
        });

        var response = await client.GetAsync("/api/profile");
        var body = await response.Content.ReadFromJsonAsync<ProfileWithIntroResponse>();

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        body!.IntroductionSv.Should().Be("Hej, jag är Alice.");
        body.IntroductionEn.Should().Be("Hi, I am Alice.");
    }

    [Fact]
    public async Task UpsertProfile_WithoutIntroduction_IntroductionFieldsAreNull()
    {
        var client = await fixture.CreateAuthenticatedClientAsync();

        await client.PutAsJsonAsync("/api/profile", new { FirstName = "Bob", LastName = "Jones" });

        var response = await client.GetAsync("/api/profile");
        var body = await response.Content.ReadFromJsonAsync<ProfileWithIntroResponse>();

        body!.IntroductionSv.Should().BeNull();
        body.IntroductionEn.Should().BeNull();
    }

    private record ProfileWithIntroResponse(
        string FirstName,
        string LastName,
        string? PictureUrl,
        string? IntroductionSv,
        string? IntroductionEn);
}
