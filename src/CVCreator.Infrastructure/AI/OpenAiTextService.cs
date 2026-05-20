using CVCreator.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using OpenAI;
using OpenAI.Chat;
using System.Runtime.CompilerServices;

namespace CVCreator.Infrastructure.AI;

public class OpenAiTextService(IConfiguration configuration) : IAiTextService
{
    private const string Model = "gpt-5-nano";

    private ChatClient Client => new(Model,
        new System.ClientModel.ApiKeyCredential(configuration["OpenAI:ApiKey"]!));

    public async IAsyncEnumerable<string> StreamImprove(string text, string language,
        [EnumeratorCancellation] CancellationToken ct = default)
    {
        var prompt = $"Improve the following {language} professional text. Return only the improved text:\n\n{text}";
        await foreach (var chunk in StreamCompletion(prompt, ct))
            yield return chunk;
    }

    public async IAsyncEnumerable<string> StreamTranslate(string text, string fromLanguage,
        [EnumeratorCancellation] CancellationToken ct = default)
    {
        var toLang = fromLanguage == "SV" ? "English" : "Swedish";
        var prompt = $"Translate the following text to {toLang}. Return only the translation:\n\n{text}";
        await foreach (var chunk in StreamCompletion(prompt, ct))
            yield return chunk;
    }

    private async IAsyncEnumerable<string> StreamCompletion(string prompt,
        [EnumeratorCancellation] CancellationToken ct)
    {
        var messages = new List<ChatMessage> { new UserChatMessage(prompt) };
        await foreach (var update in Client.CompleteChatStreamingAsync(messages, cancellationToken: ct))
        {
            foreach (var part in update.ContentUpdate)
                if (!string.IsNullOrEmpty(part.Text))
                    yield return part.Text;
        }
    }
}
