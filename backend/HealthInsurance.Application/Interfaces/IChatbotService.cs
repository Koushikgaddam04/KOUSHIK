using System.Threading.Tasks;

namespace HealthInsurance.Application.Interfaces;

public interface IChatbotService
{
    Task<string> GetChatResponseAsync(string userMessage);
}
