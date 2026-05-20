using CVCreator.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using PuppeteerSharp;
using PuppeteerSharp.Media;

namespace CVCreator.Infrastructure.Pdf;

public class PuppeteerPdfGenerator(IConfiguration configuration) : IPdfGenerator
{
    public async Task<byte[]> GenerateAsync(Guid cvId, string previewToken, CancellationToken ct = default)
    {
        var frontendBase = configuration["Frontend:BaseUrl"] ?? "http://localhost:5173";
        var url = $"{frontendBase}/cv/preview/{cvId}?token={Uri.EscapeDataString(previewToken)}";

        using var browser = await Puppeteer.LaunchAsync(new LaunchOptions
        {
            Headless = true,
            Args = ["--no-sandbox", "--disable-setuid-sandbox"]
        });

        using var page = await browser.NewPageAsync();
        await page.GoToAsync(url, new NavigationOptions { WaitUntil = [WaitUntilNavigation.Networkidle0] });

        var pdf = await page.PdfDataAsync(new PdfOptions
        {
            Format = PaperFormat.A4,
            PrintBackground = true
        });

        await browser.CloseAsync();
        return pdf;
    }
}
