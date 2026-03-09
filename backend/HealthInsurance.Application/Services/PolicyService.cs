using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HealthInsurance.Application.Interfaces;
using HealthInsurance.Domain.Entities;
using HealthInsurance.Domain;

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
        if (quote == null || quote.IsConvertedToPolicy != 0) return false;

        // 2. Try to find the Plan Template by Name to inherit the assigned Agent/Officer
        var allPolicies = await _policyRepo.GetAllAsync();
        var template = allPolicies.FirstOrDefault(p => p.PlanName == quote.SelectedPlanName && p.IsPlanTemplate == true);
        
        if (template != null)
        {
            quote.AgentId = template.AgentId;
            quote.ClaimsOfficerId = template.ClaimsOfficerId;
        }

        // 3. Mark Quote as Active Policy
        quote.IsConvertedToPolicy = 1; // Approved
        quote.IsActive = true;
        
        _quoteRepo.Update(quote);

        // 4. Generate Agent Commission (if an agent was inherited)
        if (quote.AgentId.HasValue)
        {
            var commission = new AgentCommissionLog
            {
                AgentId = quote.AgentId.Value,
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
            EntityName = "PremiumQuote",
            EntityRecordId = quote.Id, 
            ActionType = "PolicyVerification",
            NewValue = "Approved/Active",
            PerformedByUserId = UserSession.CurrentUserId 
        };
        await _auditRepo.AddAsync(log);

        return await _quoteRepo.SaveChangesAsync();
    }

    public async Task<bool> RejectPolicyAsync(string quoteReference)
    {
        var quote = await _quoteRepo.GetByReferenceAsync(quoteReference);
        if (quote == null || quote.IsConvertedToPolicy != 0) return false;

        // Mark as Rejected
        quote.IsConvertedToPolicy = 2; // Rejected
        quote.IsActive = false;
        
        _quoteRepo.Update(quote);

        // Audit the Action
        var log = new PolicyActionLog
        {
            EntityName = "PremiumQuote",
            EntityRecordId = quote.Id,
            ActionType = "PolicyVerification",
            NewValue = "Rejected/RefundPending",
            PerformedByUserId = UserSession.CurrentUserId
        };
        await _auditRepo.AddAsync(log);

        return await _quoteRepo.SaveChangesAsync();
    }
}
