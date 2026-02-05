using dataaccess.Enitity;
using dataaccess.Service.Interfaces;

namespace dataaccess.Service;

public class AuthService : IAuthService
{
    protected readonly PasswordService _passwordService;
    
    /*
    public AuthService(IAuthRepository authRepository, PasswordService passwordService, IAuthRules authRules)
        : base(authRepository)
    {
        _authRules = authRules;
        _authRepository = authRepository;
        _passwordService = passwordService;
    }
    public Task<bool> verifyPasswordByEmailAsync(string email, string plainPassword)
    {
        _authRules.ValidateVerifyPasswordByEmailAsync(email, plainPassword);
        var user = await GetUserByEmailAsync(email);
        if (user == null) return false;

        return _passwordService.VerifyPassword(plainPassword, user.Hash);
    }
    */

    
}