using dataaccess.Service.Interfaces;



namespace dataaccess.Service;

public class PasswordService : IPasswordService
{
    public string HashPassword(string plainPassword)
    {
        return BCrypt.Net.BCrypt.HashPassword(plainPassword, workFactor: 12);
    }

    public bool VerifyPassword(string plainPassword, string hashedPassword)
    {
        return BCrypt.Net.BCrypt.Verify(plainPassword, hashedPassword);
    }
}