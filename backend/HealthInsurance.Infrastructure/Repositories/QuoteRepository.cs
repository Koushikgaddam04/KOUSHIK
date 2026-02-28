using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HealthInsurance.Application.Interfaces;
using HealthInsurance.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HealthInsurance.Infrastructure.Repositories;

public class QuoteRepository : GenericRepository<PremiumQuote>, IQuoteRepository
{
    public QuoteRepository(HealthInsuranceDbContext context) : base(context) { }

    public async Task<PremiumQuote?> GetByReferenceAsync(string reference)
    {
        return await _context.PremiumQuotes
            .FirstOrDefaultAsync(q => q.QuoteReference == reference);
    }
}