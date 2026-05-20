namespace CVCreator.Application.Common.Interfaces;

public interface IFileStorage
{
    Task<Uri> UploadAsync(Stream stream, string contentType, string key);
}
