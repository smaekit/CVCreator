using CVCreator.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using PuppeteerSharp;
using PuppeteerSharp.Media;

namespace CVCreator.Infrastructure.Pdf;

public class PuppeteerPdfGenerator(IConfiguration configuration) : IPdfGenerator
{
    public async Task<byte[]> GenerateAsync(Guid cvId, string previewToken, string? theme = null, CancellationToken ct = default)
    {
        var frontendBase = configuration["Frontend:BaseUrl"] ?? "http://localhost:5173";
        var url = $"{frontendBase}/cv/preview/{cvId}?token={Uri.EscapeDataString(previewToken)}";
        if (!string.IsNullOrEmpty(theme))
            url += $"&theme={Uri.EscapeDataString(theme)}";

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

        // Lock the viewport to A4 dimensions BEFORE navigating, so the JS layout that
        // CVPreview measures is the same one Chrome will paginate when printing.
        await page.SetViewportAsync(new ViewPortOptions { Width = 794, Height = 1123 });

        // Emulate print media so CVPreview measures the same layout Chrome will paginate.
        await page.EmulateMediaTypeAsync(MediaType.Print);

        await page.GoToAsync(url, new NavigationOptions { WaitUntil = [WaitUntilNavigation.Networkidle0] });

        // CVPreview sets body[data-cv-ready="1"] once the React layout effect has converged
        // and web fonts are loaded. Without this wait, Puppeteer snapshots the first paint
        // before page-break offsets and font metrics settle.
        await page.WaitForSelectorAsync("body[data-cv-ready=\"1\"]", new WaitForSelectorOptions { Timeout = 10_000 });

        // The page footer (page number + name) is drawn into the HTML itself by CVPreview.tsx
        // so it can start at SIDEBAR_W on page 1 without bleeding under the sidebar; using
        // Chrome's native FooterTemplate would force it full-width.
        //
        // PDF mode in CVPreview renders explicit A4-sized clip windows separated by
        // page-break-after:always, so Chrome makes no pagination decisions of its own. With
        // MarginOptions=0 + PreferCSSPageSize=true + the @page CSS in CvPreviewPage, each
        // .pdf-page div maps 1:1 to a printed page at exact A4 dimensions.
        var pdf = await page.PdfDataAsync(new PdfOptions
        {
            Format = PaperFormat.A4,
            PrintBackground = true,
            PreferCSSPageSize = true,
            MarginOptions = new MarginOptions
            {
                Top = "0px",
                Bottom = "0px",
                Left = "0px",
                Right = "0px",
            },
        });

        await browser.CloseAsync();
        return pdf;
    }
}
