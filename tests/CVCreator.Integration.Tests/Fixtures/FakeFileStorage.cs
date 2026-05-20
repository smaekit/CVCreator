using CVCreator.Application.Common.Interfaces;

namespace CVCreator.Integration.Tests.Fixtures;

public class FakeFileStorage : IFileStorage
{
    public Task<Uri> UploadAsync(Stream stream, string contentType, string key)
        => Task.FromResult(new Uri($"https://test-storage/{key}"));
}
