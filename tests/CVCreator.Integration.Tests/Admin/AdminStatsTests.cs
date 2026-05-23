using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using CVCreator.Integration.Tests.Fixtures;
using FluentAssertions;

namespace CVCreator.Integration.Tests.Admin;

public class AdminStatsTests(IntegrationTestFixture fixture)
    : IClassFixture<IntegrationTestFixture>
{
    private readonly IntegrationTestFixture _fixture = fixture;

    [Fact]
    public async Task GetStats_WithoutToken_Returns401()
    {
        var client = _fixture.CreateClient();

        var response = await client.GetAsync("/api/admin/stats");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task GetStats_AsRegularUser_Returns403()
    {
        var client = await _fixture.CreateAuthenticatedClientAsync();

        var response = await client.GetAsync("/api/admin/stats");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task GetStats_AsAdmin_Returns200WithExpectedShape()
    {
        var client = await _fixture.CreateAdminClientAsync();

        var response = await client.GetAsync("/api/admin/stats?days=30");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(body);
        var root = doc.RootElement;

        // Top-level required keys
        root.TryGetProperty("generatedAt", out _).Should().BeTrue();
        root.TryGetProperty("kpis", out var kpis).Should().BeTrue();
        root.TryGetProperty("cvsCreated", out var cvsCreated).Should().BeTrue();
        root.TryGetProperty("userGrowth", out var userGrowth).Should().BeTrue();
        root.TryGetProperty("themeUsage", out var themeUsage).Should().BeTrue();
        root.TryGetProperty("topCompanies", out _).Should().BeTrue();
        root.TryGetProperty("activity", out var activity).Should().BeTrue();
        root.TryGetProperty("pricing", out var pricing).Should().BeTrue();

        // KPIs shape
        kpis.TryGetProperty("totalUsers", out var totalUsers).Should().BeTrue();
        totalUsers.GetProperty("value").GetDouble().Should().BeGreaterThanOrEqualTo(1); // admin user exists
        totalUsers.GetProperty("spark").GetArrayLength().Should().Be(14);

        // CVs-created has all 3 buckets, daily window matches `days` param
        cvsCreated.GetProperty("daily").GetArrayLength().Should().Be(30);
        cvsCreated.GetProperty("weekly").GetArrayLength().Should().Be(12);
        cvsCreated.GetProperty("monthly").GetArrayLength().Should().Be(12);

        // User growth is one point per day in the window
        userGrowth.GetArrayLength().Should().Be(30);

        // Theme usage includes all 3 themes even when counts are 0
        themeUsage.GetArrayLength().Should().Be(3);
        var themeKeys = themeUsage.EnumerateArray()
            .Select(t => t.GetProperty("key").GetString())
            .ToList();
        themeKeys.Should().Contain(["burgundy", "nordic", "charcoal"]);

        // Activity feed exists (may be empty, but property is present and is an array)
        activity.ValueKind.Should().Be(JsonValueKind.Array);

        // Pricing readiness includes verdict + criteria
        pricing.GetProperty("score").GetInt32().Should().BeInRange(0, 100);
        pricing.GetProperty("criteria").GetArrayLength().Should().Be(5);
        pricing.GetProperty("verdict").GetProperty("tone").GetString()
            .Should().BeOneOf("emerald", "amber", "rose");
    }

    [Fact]
    public async Task GetStats_AfterCreatingCv_ReflectsCount()
    {
        var userClient = await _fixture.CreateAuthenticatedClientAsync();
        await userClient.PutAsJsonAsync("/api/profile",
            new { firstName = "Test", lastName = "User", introductionSv = (string?)null, introductionEn = (string?)null });
        var createRes = await userClient.PostAsJsonAsync("/api/cvs",
            new { company = "Acme", language = "SV" });
        createRes.StatusCode.Should().Be(HttpStatusCode.Created);

        var adminClient = await _fixture.CreateAdminClientAsync();
        var response = await adminClient.GetAsync("/api/admin/stats");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadAsStringAsync();
        using var doc = JsonDocument.Parse(body);
        var topCompanies = doc.RootElement.GetProperty("topCompanies");
        topCompanies.EnumerateArray()
            .Any(c => c.GetProperty("name").GetString() == "Acme")
            .Should().BeTrue();
    }
}
