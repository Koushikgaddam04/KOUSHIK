using HealthInsurance.Domain.Entities;
using System.Threading.Tasks;

namespace HealthInsurance.Application.Interfaces;

public interface IInvoiceService
{
    Task<byte[]> GenerateInvoiceAsync(Payment payment, PremiumQuote quote, User user);
}
