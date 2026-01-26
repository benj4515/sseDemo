using System.Linq;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace server.Ex_2_MultiClient;

[ApiController]
[Route("[controller]")]
public class ChatController : ControllerBase
{
    private static readonly List<System.IO.Stream> Clients = new();
    private static readonly List<System.IO.Stream> TypingClients = new();


    [HttpGet("stream")]
    public async Task Stream()
    {
        Response.Headers.ContentType = "text/event-stream";
        Clients.Add(Response.Body);
        await Response.Body.FlushAsync();
        try
        {
            while (!HttpContext.RequestAborted.IsCancellationRequested)
            {
                await Task.Delay(1000);
            }
        }
        finally
        {
            Clients.Remove(Response.Body);
        }
    }

    [HttpGet("typingStream")]
    public async Task TypingStream()
    {
        Response.Headers.ContentType = "text/event-stream";
        TypingClients.Add(Response.Body);
        await Response.Body.FlushAsync();
        try
        {
            while (!HttpContext.RequestAborted.IsCancellationRequested)
            {
                await Task.Delay(1000);
            }
        }
        finally
        {
            TypingClients.Remove(Response.Body);
        }
    }
    
    [HttpPost("send")]
    public async Task SendMessage([FromBody] Message message)
    {

        var MessageContext = new
        {
            user = message.User,
            content = message.Content,
        };
        var messageBytes = Encoding.UTF8.GetBytes($"data: {JsonSerializer.Serialize(MessageContext)}\n\n");

        foreach (var client in Clients.ToList())
        {
            try
            {
                await client.WriteAsync(messageBytes);
                await client.FlushAsync();
            }
            catch
            {
                Clients.Remove(client);
            }
        }
    }
    
    [HttpPost("typing")]
    public async Task Typing([FromBody] TypingStatus status)
    {
        var user = string.IsNullOrWhiteSpace(status.User) ? "Someone" : status.User.Trim();
        var typingPayload = new
        {
            user,
            isTyping = status.IsTyping
        };

        var messageBytes = Encoding.UTF8.GetBytes($"data: {JsonSerializer.Serialize(typingPayload)}\n\n");

        foreach (var client in TypingClients.ToList())
        {
            try
            {
                await client.WriteAsync(messageBytes);
                await client.FlushAsync();
            }
            catch
            {
                TypingClients.Remove(client);
            }
        }
    }
    
   
}