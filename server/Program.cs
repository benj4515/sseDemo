using api;
using DotNetEnv;
using server;
using StateleSSE.AspNetCore;
using StackExchange.Redis;
using StateleSSE.AspNetCore.Extensions;
using dataaccess;
using dataaccess.Service;
using dataaccess.Service.Interfaces;

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
builder.Services.AddDbContext<AppDbContext>();
builder.Services.AddScoped<IMessageService, MessageService>();


var app = builder.Build();

app.GenerateApiClientsFromOpenApi("./../client/src/models/ServerAPI.ts").GetAwaiter().GetResult();

var backplane = app.Services.GetRequiredService<ISseBackplane>();                                                                                                                         
backplane.OnClientDisconnected += async (_, e) =>                                                                                                                                                                                                                                                                                                                               
    await backplane.Clients.SendToAllAsync(new { message = $"A user has disconnected." });



app.UseCors(_=>_.AllowAnyHeader().AllowAnyMethod().AllowAnyOrigin().SetIsOriginAllowed(_=> true));
app.MapControllers();
app.UseOpenApi();
app.UseSwaggerUi();

app.Run();