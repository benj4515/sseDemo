using System;
using System.IO;
using DotNetEnv;

namespace dataaccess;

public class DbConfig{
    static DbConfig()
    {
        LoadEnvFromKnownLocations();
    }

    private static void LoadEnvFromKnownLocations()
    {
        // Try a handful of likely locations so running from bin or the repo root still finds the .env file.
        var candidates = new[]
        {
            Path.Combine(AppContext.BaseDirectory, ".env"),
            Path.Combine(Directory.GetCurrentDirectory(), ".env"),
            Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "..", "..", ".env")), // solution root when running from bin
            Path.Combine(AppContext.BaseDirectory, "dataaccess", ".env")
        };

        foreach (var path in candidates)
        {
            if (File.Exists(path))
            {
                Env.Load(path);
                return;
            }
        }
    }

    private static string GetRequired(string key) =>
        Env.GetString(key) ?? throw new InvalidOperationException($"Missing environment variable: {key}");

    public static string ConnectionString =>
        $"Host={GetRequired("POSTGRES_HOST")};" +
        $"Database={GetRequired("POSTGRES_DB")};" +
        $"Username={GetRequired("POSTGRES_USER")};" +
        $"Password={GetRequired("POSTGRES_PASSWORD")};" +
        "SSL Mode=Require";
}