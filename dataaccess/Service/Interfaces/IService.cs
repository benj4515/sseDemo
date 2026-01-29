namespace dataaccess.Service.Interfaces;

public interface IService<T> 
    where T : class
    
{
    Task<T?> GetByIdAsync(string id);
    Task<T?> GetAllAsync();
    Task<T> CreateAsync(T createDto);
    Task<T?> UpdateAsync(string id, T updateDto);
    Task<bool> DeleteAsync(string id);
}