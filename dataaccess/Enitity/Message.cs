namespace dataaccess.Enitity;

public class Message
{
    public string Id { get; set; }
    public string UserId { get; set; }
    public string ChannelId { get; set; }
    public string Content { get; set; }
    public DateTime Timestamp { get; set; }
}