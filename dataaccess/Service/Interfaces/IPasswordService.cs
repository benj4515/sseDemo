namespace dataaccess.Service.Interfaces;

public interface IPasswordService
{
    public string HashPassword(string plainPassword);

    public bool VerifyPassword(string plainPassword, string hashedPassword);

}