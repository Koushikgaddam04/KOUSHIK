using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HealthInsurance.Application.Interfaces;
using HealthInsurance.Domain.Entities;

namespace HealthInsurance.Application.Services;

public class PremiumService : IPremiumService
{
    private readonly IQuoteRepository _quoteRepository;

    public PremiumService(IQuoteRepository quoteRepository)
    {
        _quoteRepository = quoteRepository;
    }

    public async Task<PremiumQuote> CalculateQuoteAsync(int userId, int age, string planName, string tierName)
    {
        // Real-world creative logic: 
        // 1. Base Premium is $500
        // 2. Add 10% for every 10 years of age (Age Adjustment)
        // 3. Multiply by Tier (Silver=1.0, Gold=1.2, Platinum=1.5)

        decimal basePremium = 500;
        decimal ageLoad = (age / 10) * 0.10m * basePremium;

        decimal multiplier = tierName.ToLower() switch
        {
            "gold" => 1.2m,
            "platinum" => 1.5m,
            _ => 1.0m // Silver/Default
        };

        decimal finalAmount = (basePremium + ageLoad) * multiplier;

        var quote = new PremiumQuote
        {
            UserId = userId,
            ProspectAge = age,
            SelectedPlanName = planName,
            SelectedTierName = tierName,
            CalculatedMonthlyPremium = finalAmount,
            CoverageAmount = finalAmount * 120, // 10 years of coverage
            ExpiryDate = DateTime.Now.AddDays(30),
            QuoteReference = "Q-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper()
        };

        await _quoteRepository.AddAsync(quote);
        await _quoteRepository.SaveChangesAsync();

        return quote;
    }
}
