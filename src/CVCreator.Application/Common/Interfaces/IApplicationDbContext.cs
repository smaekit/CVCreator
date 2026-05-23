using Microsoft.EntityFrameworkCore;

namespace CVCreator.Application.Common.Interfaces;

public interface IApplicationDbContext
{
    DbSet<CVCreator.Domain.Entities.Profile> Profiles { get; }
    DbSet<CVCreator.Domain.Entities.Skill> Skills { get; }
    DbSet<CVCreator.Domain.Entities.Education> Educations { get; }
    DbSet<CVCreator.Domain.Entities.Certification> Certifications { get; }
    DbSet<CVCreator.Domain.Entities.Language> Languages { get; }
    DbSet<CVCreator.Domain.Entities.Assignment> Assignments { get; }
    DbSet<CVCreator.Domain.Entities.CV> CVs { get; }
    DbSet<CVCreator.Domain.Entities.CVAssignment> CVAssignments { get; }
    DbSet<CVCreator.Domain.Entities.CVSkill> CVSkills { get; }
    DbSet<CVCreator.Domain.Entities.CVEducation> CVEducations { get; }
    DbSet<CVCreator.Domain.Entities.CVCertification> CVCertifications { get; }
    DbSet<CVCreator.Domain.Entities.CVLanguage> CVLanguages { get; }
    DbSet<CVCreator.Domain.Entities.CVFrontPageGroup> CVFrontPageGroups { get; }
    DbSet<CVCreator.Domain.Entities.CVFrontPageGroupItem> CVFrontPageGroupItems { get; }
    DbSet<CVCreator.Domain.Entities.PdfDownload> PdfDownloads { get; }
    Task<int> SaveChangesAsync(CancellationToken cancellationToken = default);
}
