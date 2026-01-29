using Microsoft.EntityFrameworkCore;

namespace dataaccess;

public class AppDbContext : DbContext
{
    public DbSet<Enitity.Channel> Channels { get; set; }
    public DbSet<Enitity.User> Users { get; set; }
    public DbSet<Enitity.Message> Messages { get; set; }
    
    protected override void OnConfiguring(DbContextOptionsBuilder options)
        => options.UseNpgsql(DbConfig.ConnectionString);
}