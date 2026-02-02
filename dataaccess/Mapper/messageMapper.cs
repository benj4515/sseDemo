using Contracts.DTO;
using dataaccess.Enitity;

namespace dataaccess.Mapper;

public class messageMapper
{
    public static Message MapToEntity(MessageDTO dto)
    {
        return new Message
        {
            Id = Guid.NewGuid().ToString(),
            UserId = dto.UserId,
            ChannelId = dto.ChannelId,
            Content = dto.Content,
            Timestamp = DateTime.UtcNow
        };
    }
}