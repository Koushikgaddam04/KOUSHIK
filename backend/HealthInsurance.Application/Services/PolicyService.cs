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

        // 2. Try to find the Plan Template by Name to inherit the assigned Agent
        int? inheritedAgentId = null;
        var allPolicies = await _policyRepo.GetAllAsync();
        var template = allPolicies.FirstOrDefault(p => p.PlanName == quote.SelectedPlanName && p.IsPlanTemplate == true);
        if (template != null)
        {
            inheritedAgentId = template.AgentId;
        }

        // 3. Create the real Policy (The "Contract")
        var policy = new HealthInsurance.Domain.Entities.Policy
        {
            PolicyNumber = "POL-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper(),
            UserId = customerId,
            PlanName = quote.SelectedPlanName,

            MonthlyPremium = quote.CalculatedMonthlyPremium,
            CoverageAmount = quote.CoverageAmount,
            ExpiryDate = DateTime.Now.AddYears(1),
            Status = "Active",
            AgentId = inheritedAgentId, // Inherit from template
            IsPlanTemplate = false      // This is a customer instance
        };

        await _policyRepo.AddAsync(policy);

        // 4. Mark Quote as Converted
        quote.IsConvertedToPolicy = true;
        _quoteRepo.Update(quote);

        // 5. Creative Logic: Generate Agent Commission (if an agent was inherited)
        if (inheritedAgentId.HasValue)
        {
            var commission = new AgentCommissionLog
            {
                AgentId = inheritedAgentId.Value,
                PremiumAmount = quote.CalculatedMonthlyPremium,
                CommissionRate = 0.10m,
                EarnedAmount = quote.CalculatedMonthlyPremium * 0.10m,
                Status = "Pending"
            };
            await _commissionRepo.AddAsync(commission);
        }

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