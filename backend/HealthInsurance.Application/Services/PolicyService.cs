using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HealthInsurance.Application.Interfaces;
using HealthInsurance.Domain.Entities;

namespace HealthInsurance.Application.Services;

public class PolicyService : IPolicyService
{
    private readonly IQuoteRepository _quoteRepo;
    private readonly IGenericRepository<Policy> _policyRepo;
    private readonly IGenericRepository<AgentCommissionLog> _commissionRepo;
    private readonly IGenericRepository<PolicyActionLog> _auditRepo;

    public PolicyService(
        IQuoteRepository quoteRepo,
        IGenericRepository<Policy> policyRepo,
        IGenericRepository<AgentCommissionLog> commissionRepo,
        IGenericRepository<PolicyActionLog> auditRepo)
    {
        _quoteRepo = quoteRepo;
        _policyRepo = policyRepo;
        _commissionRepo = commissionRepo;
        _auditRepo = auditRepo;
    }

    public async Task<bool> ActivatePolicyAsync(string quoteReference, int customerId)
    {
        // 1. Find the Quote
        var quote = await _quoteRepo.GetByReferenceAsync(quoteReference);
        if (quote == null || quote.IsConvertedToPolicy) return false;

        // 2. Create the real Policy (The "Contract")
        var policy = new HealthInsurance.Domain.Entities.Policy
        {
            PolicyNumber = "POL-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper(),
            UserId = customerId,
            PlanName = quote.SelectedPlanName,
            TierName = quote.SelectedTierName,
            MonthlyPremium = quote.CalculatedMonthlyPremium,
            CoverageAmount = quote.CoverageAmount,
            ExpiryDate = DateTime.Now.AddYears(1),
            Status = "Active"
        };

        await _policyRepo.AddAsync(policy);

        // 3. Mark Quote as Converted
        quote.IsConvertedToPolicy = true;
        _quoteRepo.Update(quote);

        // 4. Creative Logic: Generate Agent Commission
        // Assume AgentId 2 for now; 10% commission rate
        var commission = new AgentCommissionLog
        {
            AgentId = 2,
            PremiumAmount = quote.CalculatedMonthlyPremium,
            CommissionRate = 0.10m,
            EarnedAmount = quote.CalculatedMonthlyPremium * 0.10m,
            Status = "Pending"
        };
        await _commissionRepo.AddAsync(commission);

        // 5. Audit the Action
        var log = new PolicyActionLog
        {
            EntityName = "Policy",
            EntityRecordId = 0, // Will be updated after Save
            ActionType = "Activation",
            NewValue = "Active",
            PerformedByUserId = 1 // Admin
        };
        await _auditRepo.AddAsync(log);

        return await _policyRepo.SaveChangesAsync();
    }
}