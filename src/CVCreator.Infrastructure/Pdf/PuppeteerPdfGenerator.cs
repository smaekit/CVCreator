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

        // Use system Chrome path if set (Docker/prod); otherwise download Chrome via BrowserFetcher (local dev).
        var executablePath = Environment.GetEnvironmentVariable("PUPPETEER_EXECUTABLE_PATH")
                             ?? configuration["Puppeteer:ExecutablePath"];

        if (string.IsNullOrEmpty(executablePath))
        {
            var fetcher = new BrowserFetcher(SupportedBrowser.Chrome);
            var installed = await fetcher.DownloadAsync();
            executablePath = installed.GetExecutablePath();
        }

        using var browser = await Puppeteer.LaunchAsync(new LaunchOptions
        {
            Headless = true,
            ExecutablePath = executablePath,
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
