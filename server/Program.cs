using server;
using StateleSSE.AspNetCore;
using StackExchange.Redis;
using StateleSSE.AspNetCore.Extensions;

var builder = WebApplication.CreateBuilder(args);
builder.Services.Configure<HostOptions>(options =>
    {
    options.ShutdownTimeout = TimeSpan.FromSeconds(0);
});
builder.Services.AddInMemorySseBackplane();
builder.Services.AddControllers();
builder.Services.AddCors();
builder.Services.AddOpenApiDocument();
builder.Services.AddSingleton<IConnectionMultiplexer>(sp =>
{
    var config = ConfigurationOptions.Parse("localhost:6379");
    config.AbortOnConnectFail = false;
    return ConnectionMultiplexer.Connect(config);
});
builder.Services.AddRedisSseBackplane();


var app = builder.Build();

var backplane = app.Services.GetRequiredService<ISseBackplane>();                                                                                                                         
backplane.OnClientDisconnected += async (_, e) =>                                                                                                                                                                                                                                                                                                                               
    await backplane.Clients.SendToAllAsync(new { message = $"A user has disconnected." });



app.UseCors(_=>_.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin().SetIsOriginAllowed(_=> true));
app.MapControllers();
app.UseOpenApi();
app.UseSwaggerUi();

app.Run();