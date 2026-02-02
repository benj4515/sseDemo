using System.Text;
using Contracts.DTO;
using dataaccess.Service.Interfaces;

namespace server.Ex_2_MultiClient;

using System.Text.Json;
using Microsoft.AspNetCore.Mvc;
using StateleSSE.AspNetCore;
using dataaccess.Service;



public class RealtimeController : ControllerBase
{
    
    private readonly IMessageService _messageService;
    private ISseBackplane _backplane;
    private static readonly List<System.IO.Stream> TypingClients = new();
    
    public RealtimeController(ISseBackplane backplane, IMessageService messageService)
    {
        _messageService = messageService;
        _backplane = backplane;
    }
    
    
    
    [HttpGet("connect")]
    public async Task Connect()
    {
        
        await using var sse = await HttpContext.OpenSseStreamAsync();
        await using var connection = _backplane.CreateConnection();

        await sse.WriteAsync("connected", JsonSerializer.Serialize(new { connection.ConnectionId },
            new JsonSerializerOptions()
            {
                PropertyNamingPolicy = JsonNamingPolicy.CamelCase
            }));

        await foreach (var evt in connection.ReadAllAsync(HttpContext.RequestAborted))
            await sse.WriteAsync(evt.Group ?? "message", evt.Data);
    }

    [HttpPost("join")]
    public async Task<List<MessageDTO>> Join(string connectionId, string room)
    {
        await _backplane.Groups.AddToGroupAsync(connectionId, room);
        await _backplane.Clients.SendToGroupAsync(room, new { message = $"A new user has joined {room}." });
        var messages = _messageService.getMessagesByChannelIdAsync(room);
        return await messages;
    }
        
    [HttpPost("leave")]
    public async Task Leave(string connectionId, string room)
    {
        await _backplane.Groups.RemoveFromGroupAsync(connectionId, room);
        await _backplane.Clients.SendToGroupAsync(room, new { message = $"A user has left {room}." });
    }
    
    
    [HttpPost("send")]
    [Produces<MessageDTO>]
    public async Task Send( MessageDTO message)
    {
        await _messageService.CreateAsync(message);
        await _backplane.Clients.SendToGroupAsync(message.ChannelId, new { message });
    }

    [HttpPost("poke")]
    public async Task Poke(string connectionId)
    {
        var message = $"You have been poked!";
        await _backplane.Clients.SendToClientAsync(connectionId, new { message });
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