
using Contracts.DTO;

namespace dataaccess.Service.Interfaces;

public interface IMessageService : IService<Contracts.DTO.MessageDTO>
{
    Task<List<MessageDTO>> getMessagesByChannelIdAsync(string channelId);
    
}