using CVCreator.Domain.Entities;
using CVCreator.Domain.ViewModels;

namespace CVCreator.Domain.Services;

public static class CVCompositionService
{
    public static ResolvedCv Compose(
        Profile profile,
        CV cv,
        List<(CVAssignment CVAssignment, Assignment Assignment)> selectedAssignments,
        List<(CVSkill CVSkill, Skill Skill)> selectedSkills,
        List<(CVEducation CVEducation, Education Education)> selectedEducations,
        List<(CVCertification CVCertification, Certification Certification)> selectedCertifications,
        List<(CVLanguage CVLanguage, Language Language)> selectedLanguages)
    {
        var lang = cv.Language;
        var r = BilingualTextResolver.Resolve;

        var hasIntroOverride = cv.IntroductionOverride is not null;
        var introResolved = hasIntroOverride
            ? new BilingualResult(cv.IntroductionOverride!, false)
            : r(profile.IntroductionSv, profile.IntroductionEn, lang);
        var intro = introResolved;

        var assignments = selectedAssignments
            .OrderBy(x => x.CVAssignment.DisplayOrder)
            .Select(x =>
            {
                var cva = x.CVAssignment;
                var a = x.Assignment;
                var title = r(a.TitleSv, a.TitleEn, lang);
                var hasOverride = cva.DescriptionOverride is not null;
                var descText = hasOverride
                    ? new BilingualResult(cva.DescriptionOverride!, false)
                    : r(a.DescriptionSv, a.DescriptionEn, lang);
                return new ResolvedAssignment(
                    a.Id,
                    new ResolvedText(title.Text, title.FallbackUsed),
                    new ResolvedText(descText.Text, descText.FallbackUsed),
                    a.Client,
                    a.StartDate.ToString("yyyy-MM-dd"),
                    a.EndDate?.ToString("yyyy-MM-dd"),
                    cva.IsHighlighted,
                    cva.DisplayOrder,
                    hasOverride);
            }).ToList();

        var skills = selectedSkills
            .OrderBy(x => x.CVSkill.DisplayOrder)
            .Select(x => new ResolvedSkill(x.Skill.Id, x.Skill.Name, x.Skill.Category, x.CVSkill.DisplayOrder))
            .ToList();

        var educations = selectedEducations
            .OrderBy(x => x.CVEducation.DisplayOrder)
            .Select(x =>
            {
                var degree = r(x.Education.DegreeSv, x.Education.DegreeEn, lang);
                return new ResolvedEducation(
                    x.Education.Id,
                    new ResolvedText(degree.Text, degree.FallbackUsed),
                    x.Education.School,
                    x.Education.StartYear,
                    x.Education.EndYear,
                    x.CVEducation.DisplayOrder);
            }).ToList();

        var certs = selectedCertifications
            .OrderBy(x => x.CVCertification.DisplayOrder)
            .Select(x =>
            {
                var name = r(x.Certification.NameSv, x.Certification.NameEn, lang);
                return new ResolvedCertification(
                    x.Certification.Id,
                    new ResolvedText(name.Text, name.FallbackUsed),
                    x.Certification.Year,
                    x.Certification.Link,
                    x.CVCertification.DisplayOrder);
            }).ToList();

        var langs = selectedLanguages
            .OrderBy(x => x.CVLanguage.DisplayOrder)
            .Select(x => new ResolvedLanguage(x.Language.Id, x.Language.Name, x.Language.Proficiency, x.CVLanguage.DisplayOrder))
            .ToList();

        return new ResolvedCv(
            profile.FirstName, profile.LastName, profile.PictureUrl,
            new ResolvedText(intro.Text, intro.FallbackUsed),
            hasIntroOverride,
            assignments, skills, educations, certs, langs,
            lang,
            cv.YearsOfExperience);
    }
}
