using Microsoft.AspNetCore.Mvc;

namespace server.EX_1_HelloWorld;

[ApiController]
[Route("[controller]")]
public class WeatherController : ControllerBase
{
    [HttpGet("stream")]
    public async Task Stream()
    {
        Response.Headers.ContentType = "text/event-stream";
        while (true)
        {
            await Task.Delay(2000);
            var weatherUpdate = System.Text.Encoding.UTF8.GetBytes($"it is sunny and {new Random().Next()}) degrees at {DateTime.Now.ToLocalTime()}\n\n");
            await Response.Body.WriteAsync(weatherUpdate);
            await Response.Body.FlushAsync();
        }
    }
    
    [HttpGet("keypress")]
    public async Task KeyPress()
    {
        Response.Headers.ContentType = "text/event-stream";
        while (true)
        {
            var line = Console.ReadLine();
            var message = System.Text.Encoding.UTF8.GetBytes($"data: {line}\n\n");
            await Response.Body.WriteAsync(message);
            await Response.Body.FlushAsync();
        }
    }
    
}