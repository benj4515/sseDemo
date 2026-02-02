using dataaccess.Enitity;
using dataaccess.Mapper;
using dataaccess.Service.Interfaces;
using Contracts.DTO;
using Microsoft.EntityFrameworkCore;

namespace dataaccess.Service;

public class MessageService : IMessageService
{
    
    protected readonly DbSet<Message> _dbSet;
    protected readonly AppDbContext _dbContext;
    
    public MessageService(AppDbContext dbContext)
    {
        _dbContext = dbContext;
        _dbSet = _dbContext.Set<Message>();
    }
    public Task<MessageDTO> GetByIdAsync(string id)
    {
        throw new NotImplementedException();
    }

    public Task<MessageDTO> GetAllAsync()
    {
        throw new NotImplementedException();
    }

    

    public async Task<MessageDTO> CreateAsync(MessageDTO createDto)
    {
        var entity = messageMapper.MapToEntity(createDto);
        await _dbSet.AddAsync(entity);
        await _dbContext.SaveChangesAsync();
        return createDto;
    }

    public Task<MessageDTO?> UpdateAsync(string id, MessageDTO updateDto)
    {
        throw new NotImplementedException();
    }

   
   

    public Task<bool> DeleteAsync(string id)
    {
        throw new NotImplementedException();
    }

    public Task<List<MessageDTO>> getMessagesByChannelIdAsync(string channelId)
    {
        var messages = _dbSet.Where(m => m.ChannelId == channelId).OrderBy(m => m.Timestamp).Select(m => new MessageDTO
        {
            UserId = m.UserId,
            ChannelId = m.ChannelId,
            Content = m.Content,
        }).ToListAsync();
        return messages;
    }
}