using dataaccess.Enitity;
using dataaccess.Service.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace dataaccess.Service;

public class MessageService : IMessageService
{
    
    protected readonly DbSet<Message> _dbSet;
    protected readonly AppDbContext _dbContext;
    public Task<Message?> GetByIdAsync(string id)
    {
        throw new NotImplementedException();
    }

    public Task<Message?> GetAllAsync()
    {
        throw new NotImplementedException();
    }

    public async Task<Message> CreateAsync(Message createDto)
    {
        _dbSet.AddAsync(createDto);
        await _dbContext.SaveChangesAsync();
        return createDto;
    }

    public Task<Message?> UpdateAsync(string id, Message updateDto)
    {
        throw new NotImplementedException();
    }

    public Task<bool> DeleteAsync(string id)
    {
        throw new NotImplementedException();
    }
}