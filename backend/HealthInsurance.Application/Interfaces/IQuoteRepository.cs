using HealthInsurance.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthInsurance.Application.Interfaces;

public interface IQuoteRepository : IGenericRepository<PremiumQuote> // Added 'public'
{
    Task<PremiumQuote?> GetByReferenceAsync(string reference);
}
