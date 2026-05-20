using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using CVCreator.Application.Common.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;

namespace CVCreator.Infrastructure.Identity;

public class PreviewTokenService(IConfiguration configuration) : IPreviewTokenService
{
    private const string CvIdClaim = "cvId";

    private SymmetricSecurityKey Key => new(
        Encoding.UTF8.GetBytes(configuration["PreviewToken:Secret"]
            ?? "preview-token-secret-must-be-at-least-32-chars!"));

    public string Issue(Guid cvId)
    {
        var credentials = new SigningCredentials(Key, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer: "CVCreator.Preview",
            audience: "CVCreator.Preview",
            claims: [new Claim(CvIdClaim, cvId.ToString())],
            expires: DateTime.UtcNow.AddSeconds(60),
            signingCredentials: credentials);
        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public bool Validate(string token, out Guid cvId)
    {
        cvId = Guid.Empty;
        var handler = new JwtSecurityTokenHandler();
        var parameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true, IssuerSigningKey = Key,
            ValidateIssuer = true, ValidIssuer = "CVCreator.Preview",
            ValidateAudience = true, ValidAudience = "CVCreator.Preview",
            ValidateLifetime = true
        };

        try
        {
            var principal = handler.ValidateToken(token, parameters, out _);
            var claim = principal.FindFirstValue(CvIdClaim);
            return Guid.TryParse(claim, out cvId);
        }
        catch
        {
            return false;
        }
    }
}
