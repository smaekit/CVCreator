using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using CVCreator.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;

namespace CVCreator.Infrastructure.Storage;

public class AzureBlobStorage(IConfiguration configuration) : IFileStorage
{
    private const string ContainerName = "profile-pictures";

    public async Task<Uri> UploadAsync(Stream stream, string contentType, string key)
    {
        var client = new BlobServiceClient(configuration["AzureStorage:ConnectionString"]);
        var container = client.GetBlobContainerClient(ContainerName);
        await container.CreateIfNotExistsAsync(PublicAccessType.Blob);
        var blob = container.GetBlobClient(key);
        await blob.UploadAsync(stream, new BlobHttpHeaders { ContentType = contentType });
        return blob.Uri;
    }
}
