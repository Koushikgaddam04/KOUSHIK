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

    public async Task<PremiumQuote> CalculateQuoteAsync(int userId, int age, string planName, string tierName, int familySize = 1, string preExistingConditions = "", bool isPorting = false, string prevPolNum = "", string prevInsurer = "", bool saveToDb = false)
    {
        // Real-world creative logic: 
        // 1. Fetch the original template for this plan to get the Dynamic BasePremium
        // 2. Add 10% for every 10 years of age (Age Adjustment for eldest member)
        // 3. Multiply by Tier (Silver=1.0, Gold=1.2, Platinum=1.5)
        // 4. Multiply by Family Size (1 member = 1.0, each additional member adds 20%)

        var allPolicies = await _policyRepository.GetAllAsync();
        var template = allPolicies.FirstOrDefault(p => p.IsPlanTemplate && p.PlanName.Equals(planName, StringComparison.OrdinalIgnoreCase));

        decimal basePremium = template != null ? template.MonthlyPremium : 500m;
        decimal baseCoverage = template != null ? template.CoverageAmount : (basePremium * 120);

        decimal ageLoad = (age / 10) * 0.10m * basePremium;

        decimal tierMultiplier = tierName.ToLower() switch
        {
            "gold" => 1.2m,
            "platinum" => 1.5m,
            _ => 1.0m // Silver/Default
        };

        // Family Floater Logic: Sum insured is shared, but premium increases per person
        decimal familyMultiplier = 1.0m + (familySize - 1) * 0.20m;

        decimal finalAmount = (basePremium + ageLoad) * tierMultiplier * familyMultiplier;
        decimal finalCoverage = baseCoverage * tierMultiplier; // Sum insured remains shared (Floater)

        var quote = new PremiumQuote
        {
            UserId = userId,
            ProspectAge = age,
            SelectedPlanName = planName,
            SelectedTierName = tierName,
            FamilySize = familySize,
            PreExistingConditions = preExistingConditions,
            IsPorting = isPorting,
            PreviousPolicyNumber = prevPolNum,
            PreviousInsurer = prevInsurer,
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
