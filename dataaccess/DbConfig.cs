namespace dataaccess;
using DotNetEnv;

public class DbConfig
{
    
    static DbConfig()
    {
        Env.Load(Path.Combine(Directory.GetCurrentDirectory(), ".env"));
    }
    
    
    public static string ConnectionString =>
        
        $"Host={Env.GetString("POSTGRES_HOST")};" +
        $"Database={Env.GetString("POSTGRES_DB")};" +
        $"Username={Env.GetString("POSTGRES_USER")};" +
        $"Password={Env.GetString("POSTGRES_PASSWORD")};" +
        "SSL Mode=Require";
}