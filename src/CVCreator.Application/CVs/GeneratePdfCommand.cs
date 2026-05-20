using CVCreator.Application.Common.Interfaces;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace CVCreator.Application.CVs;

public record GeneratePdfCommand(Guid CvId) : IRequest<PdfResult?>;
public record PdfResult(byte[] Bytes, string FileName);

public class GeneratePdfHandler(
    IApplicationDbContext db,
    ICurrentUserService currentUser,
    IPreviewTokenService previewTokenService,
    IPdfGenerator pdfGenerator) : IRequestHandler<GeneratePdfCommand, PdfResult?>
{
    public async Task<PdfResult?> Handle(GeneratePdfCommand request, CancellationToken ct)
    {
        var cv = await db.CVs.FirstOrDefaultAsync(c => c.Id == request.CvId && c.UserId == currentUser.UserId, ct);
        if (cv is null) return null;

        var token = previewTokenService.Issue(cv.Id);
        var bytes = await pdfGenerator.GenerateAsync(cv.Id, token, ct);
        return new PdfResult(bytes, $"{cv.Name}.pdf");
    }
}
