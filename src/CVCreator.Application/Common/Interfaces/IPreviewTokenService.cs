namespace CVCreator.Application.Common.Interfaces;

public interface IPreviewTokenService
{
    string Issue(Guid cvId);
    bool Validate(string token, out Guid cvId);
}
