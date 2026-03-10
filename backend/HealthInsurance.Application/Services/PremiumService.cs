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
    private readonly IGenericRepository<Policy> _policyRepository;

    public PremiumService(IQuoteRepository quoteRepository, IGenericRepository<Policy> policyRepository)
    {
        _quoteRepository = quoteRepository;
        _policyRepository = policyRepository;
    }

    public async Task<PremiumQuote> CalculateQuoteAsync(int userId, int age, string planName, string tierName, bool saveToDb = false)
    {
        // Real-world creative logic: 
        // 1. Fetch the original template for this plan to get the Dynamic BasePremium
        // 2. Add 10% for every 10 years of age (Age Adjustment)
        // 3. Multiply by Tier (Silver=1.0, Gold=1.2, Platinum=1.5)

        var allPolicies = await _policyRepository.GetAllAsync();
        var template = allPolicies.FirstOrDefault(p => p.IsPlanTemplate && p.PlanName.Equals(planName, StringComparison.OrdinalIgnoreCase));

        decimal basePremium = template != null ? template.MonthlyPremium : 500m;
        decimal baseCoverage = template != null ? template.CoverageAmount : (basePremium * 120);

        decimal ageLoad = (age / 10) * 0.10m * basePremium;

        decimal multiplier = tierName.ToLower() switch
        {
            "gold" => 1.2m,
            "platinum" => 1.5m,
            _ => 1.0m // Silver/Default
        };

        decimal finalAmount = (basePremium + ageLoad) * multiplier;
        decimal finalCoverage = baseCoverage * multiplier;

        var quote = new PremiumQuote
        {
            UserId = userId,
            ProspectAge = age,
            SelectedPlanName = planName,
            SelectedTierName = tierName,
            CalculatedMonthlyPremium = finalAmount,
            CoverageAmount = finalCoverage,
            ExpiryDate = DateTime.Now.AddDays(30),
            AgentId = template?.AgentId,
            ClaimsOfficerId = template?.ClaimsOfficerId,
            QuoteReference = "Q-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper()
        };

        if (saveToDb)
        {
            await _quoteRepository.AddAsync(quote);
            await _quoteRepository.SaveChangesAsync();
        }

        return quote;
    }
}
