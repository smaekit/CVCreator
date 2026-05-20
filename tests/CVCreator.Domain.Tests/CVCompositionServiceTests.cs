using CVCreator.Domain.Entities;
using CVCreator.Domain.Services;
using CVCreator.Domain.ViewModels;
using FluentAssertions;

namespace CVCreator.Domain.Tests;

public class CVCompositionServiceTests
{
    private static Profile MakeProfile(string? introSv = null, string? introEn = null) => new()
    {
        UserId = "user1",
        FirstName = "Alice",
        LastName = "Smith",
        IntroductionSv = introSv,
        IntroductionEn = introEn
    };

    private static CV MakeCv(string lang = "EN") => new()
    {
        UserId = "user1",
        Company = "Acme",
        Language = lang
    };

    private static Assignment MakeAssignment(string? titleSv = null, string? titleEn = null,
        string? descSv = null, string? descEn = null) => new()
    {
        UserId = "user1",
        TitleSv = titleSv, TitleEn = titleEn,
        DescriptionSv = descSv, DescriptionEn = descEn,
        Client = "Client",
        StartDate = new DateOnly(2022, 1, 1)
    };

    [Fact]
    public void Compose_EnCv_ResolvesEnglishText()
    {
        var profile = MakeProfile(introSv: "Hej", introEn: "Hello");
        var cv = MakeCv("EN");

        var result = CVCompositionService.Compose(profile, cv, [], [], [], [], []);

        result.Introduction.Text.Should().Be("Hello");
        result.Introduction.FallbackUsed.Should().BeFalse();
    }

    [Fact]
    public void Compose_EnCv_MissingEnIntro_FallsBackToSv()
    {
        var profile = MakeProfile(introSv: "Hej", introEn: null);
        var cv = MakeCv("EN");

        var result = CVCompositionService.Compose(profile, cv, [], [], [], [], []);

        result.Introduction.Text.Should().Be("Hej");
        result.Introduction.FallbackUsed.Should().BeTrue();
    }

    [Fact]
    public void Compose_Assignment_OverrideWinsOverProfileDescription()
    {
        var assignment = MakeAssignment(titleEn: "Dev", descEn: "Original desc");
        var cva = new CVAssignment
        {
            AssignmentId = assignment.Id,
            DescriptionOverride = "Tailored desc",
            DisplayOrder = 0
        };
        var profile = MakeProfile();
        var cv = MakeCv("EN");

        var result = CVCompositionService.Compose(profile, cv,
            [(cva, assignment)], [], [], [], []);

        result.Assignments[0].Description.Text.Should().Be("Tailored desc");
        result.Assignments[0].IsDescriptionOverridden.Should().BeTrue();
    }

    [Fact]
    public void Compose_Assignment_NoOverride_UsesMasterDescription()
    {
        var assignment = MakeAssignment(titleEn: "Dev", descEn: "Master desc");
        var cva = new CVAssignment { AssignmentId = assignment.Id, DisplayOrder = 0 };
        var profile = MakeProfile();
        var cv = MakeCv("EN");

        var result = CVCompositionService.Compose(profile, cv,
            [(cva, assignment)], [], [], [], []);

        result.Assignments[0].Description.Text.Should().Be("Master desc");
        result.Assignments[0].IsDescriptionOverridden.Should().BeFalse();
    }

    [Fact]
    public void Compose_AssignmentsOrderedByDisplayOrder()
    {
        var a1 = MakeAssignment(titleEn: "First");
        var a2 = MakeAssignment(titleEn: "Second");
        var cva1 = new CVAssignment { AssignmentId = a1.Id, DisplayOrder = 2 };
        var cva2 = new CVAssignment { AssignmentId = a2.Id, DisplayOrder = 1 };
        var profile = MakeProfile();
        var cv = MakeCv("EN");

        var result = CVCompositionService.Compose(profile, cv,
            [(cva1, a1), (cva2, a2)], [], [], [], []);

        result.Assignments[0].Title.Text.Should().Be("Second");
        result.Assignments[1].Title.Text.Should().Be("First");
    }

    [Fact]
    public void Compose_SkillsIncludedInResult()
    {
        var skill = new Skill { UserId = "user1", Name = "C#", Category = "Backend" };
        var cvs = new CVSkill { SkillId = skill.Id, DisplayOrder = 0 };
        var profile = MakeProfile();
        var cv = MakeCv("EN");

        var result = CVCompositionService.Compose(profile, cv,
            [], [(cvs, skill)], [], [], []);

        result.Skills.Should().ContainSingle(s => s.Name == "C#");
    }

    [Fact]
    public void Compose_UnselectedItemsNotInResult()
    {
        var profile = MakeProfile();
        var cv = MakeCv("EN");

        var result = CVCompositionService.Compose(profile, cv, [], [], [], [], []);

        result.Assignments.Should().BeEmpty();
        result.Skills.Should().BeEmpty();
    }

    [Fact]
    public void Compose_FrontPageGroups_IncludedInResult()
    {
        var profile = MakeProfile();
        var cv = MakeCv("EN");
        var groups = new List<ResolvedFrontPageGroup>
        {
            new(Guid.NewGuid(), "Cloud Skills", false, 0,
                [new(Guid.NewGuid(), "Azure", 0)])
        };

        var result = CVCompositionService.Compose(profile, cv, [], [], [], [], [], groups);

        result.FrontPageGroups.Should().ContainSingle(g => g.Header == "Cloud Skills");
        result.FrontPageGroups[0].Items.Should().ContainSingle(i => i.Label == "Azure");
    }

    [Fact]
    public void Compose_NoFrontPageGroups_ReturnsEmpty()
    {
        var profile = MakeProfile();
        var cv = MakeCv("EN");

        var result = CVCompositionService.Compose(profile, cv, [], [], [], [], []);

        result.FrontPageGroups.Should().BeEmpty();
    }
}
