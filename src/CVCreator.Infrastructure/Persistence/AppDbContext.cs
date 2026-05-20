using CVCreator.Application.Common.Interfaces;
using CVCreator.Domain.Entities;
using CVCreator.Infrastructure.Identity;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;

namespace CVCreator.Infrastructure.Persistence;

public class AppDbContext(DbContextOptions<AppDbContext> options)
    : IdentityDbContext<ApplicationUser>(options), IApplicationDbContext
{
    public DbSet<Profile> Profiles => Set<Profile>();
    public DbSet<Skill> Skills => Set<Skill>();
    public DbSet<Education> Educations => Set<Education>();
    public DbSet<Certification> Certifications => Set<Certification>();
    public DbSet<Language> Languages => Set<Language>();
    public DbSet<Assignment> Assignments => Set<Assignment>();
    public DbSet<CV> CVs => Set<CV>();
    public DbSet<CVAssignment> CVAssignments => Set<CVAssignment>();
    public DbSet<CVSkill> CVSkills => Set<CVSkill>();
    public DbSet<CVEducation> CVEducations => Set<CVEducation>();
    public DbSet<CVCertification> CVCertifications => Set<CVCertification>();
    public DbSet<CVLanguage> CVLanguages => Set<CVLanguage>();
    public DbSet<CVFrontPageGroup> CVFrontPageGroups => Set<CVFrontPageGroup>();
    public DbSet<CVFrontPageGroupItem> CVFrontPageGroupItems => Set<CVFrontPageGroupItem>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.Entity<AssignmentSkill>().HasKey(a => new { a.AssignmentId, a.SkillId });
        modelBuilder.Entity<CVAssignment>().HasKey(a => new { a.CVId, a.AssignmentId });
        modelBuilder.Entity<CVSkill>().HasKey(a => new { a.CVId, a.SkillId });
        modelBuilder.Entity<CVEducation>().HasKey(a => new { a.CVId, a.EducationId });
        modelBuilder.Entity<CVCertification>().HasKey(a => new { a.CVId, a.CertificationId });
        modelBuilder.Entity<CVLanguage>().HasKey(a => new { a.CVId, a.LanguageId });
    }
}
