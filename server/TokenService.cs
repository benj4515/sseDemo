using System.Security.Claims;
using System.Text;
using api.Models;
using dataaccess.Enitity;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.JsonWebTokens;
using Microsoft.IdentityModel.Tokens;




namespace service.Services;

public class TokenService
{
    private readonly IConfiguration _config;
    private readonly JwtSettings _settings;

    public TokenService(IConfiguration config, IOptions<JwtSettings> settings)
    {
        _config = config;
        _settings = settings.Value;
    }
    
    public const string SignatureAlgorithm = SecurityAlgorithms.HmacSha512;
    public const string JwtKey = "JWT_SECRET";
    
    public string CreateToken(User user)
    {

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.UserID),
            new Claim(ClaimTypes.Role, user.Role.ToString()),
        };
        
        var key = Convert.FromBase64String(_config.GetValue<string>(JwtKey)!);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SignatureAlgorithm
            ),
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddDays(7),
        };
        var tokenHandler = new JsonWebTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return token;
    }
    
    
    
    public static TokenValidationParameters ValidationParameters(IConfiguration config)
    {
        var key = Convert.FromBase64String(config.GetValue<string>(JwtKey)!);
        return new TokenValidationParameters
        {
            IssuerSigningKey = new SymmetricSecurityKey(key),
            ValidAlgorithms = [SignatureAlgorithm],
            ValidateIssuerSigningKey = true,
            TokenDecryptionKey = null,

            ValidateIssuer = false,
            ValidateAudience = false,
            ValidateLifetime = true,

            // Set to 0 when validating on the same system that created the token
            ClockSkew = TimeSpan.Zero,
        };
    }
}