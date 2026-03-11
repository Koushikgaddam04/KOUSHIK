using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HealthInsurance.Application.Interfaces;
using HealthInsurance.Domain.Entities;
using HealthInsurance.Domain.Enums;

namespace HealthInsurance.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IGenericRepository<HealthInsurance.Domain.Entities.Policy> _policyRepo;
    private readonly IGenericRepository<Claim> _claimRepo;
    private readonly IGenericRepository<AgentCommissionLog> _commissionRepo;
    private readonly IGenericRepository<DocumentVault> _docRepo;
    private readonly IQuoteRepository _quoteRepo;
    private readonly IGenericRepository<User> _userRepo;
    private readonly IGenericRepository<PolicyActionLog> _auditRepo;

    public DashboardService(
        IGenericRepository<Policy> policyRepo,
        IGenericRepository<Claim> claimRepo,
        IGenericRepository<AgentCommissionLog> commissionRepo,
        IGenericRepository<DocumentVault> docRepo,
        IQuoteRepository quoteRepo,
        IGenericRepository<User> userRepo,
        IGenericRepository<PolicyActionLog> auditRepo)
    {
        _policyRepo = policyRepo;
        _claimRepo = claimRepo;
        _commissionRepo = commissionRepo;
        _docRepo = docRepo;
        _quoteRepo = quoteRepo;
        _userRepo = userRepo;
        _auditRepo = auditRepo;
    }

    public async Task<Dictionary<string, object>> GetAdminStatsAsync()
    {
        // Legacy policies (admin-created, excludes admin's own placeholder with UserId=1)
        var legacyPolicies = (await _policyRepo.GetAllAsync())
            .Where(p => p.IsActive && p.UserId != 1)
            .ToList();

        // PremiumQuotes acting as policies (the main new flow):
        // IsConvertedToPolicy = 1 means "Active" (approved and converted)
        var allQuotes = (await _quoteRepo.GetAllAsync()).ToList();
        var activePolicyQuotes = allQuotes
            .Where(q => q.IsActive && q.IsConvertedToPolicy == 1)
            .ToList();

        var claims = (await _claimRepo.GetAllAsync()).ToList();
        var commissions = (await _commissionRepo.GetAllAsync()).ToList();
        var docs = (await _docRepo.GetAllAsync()).ToList();
        
        var allUsers = await _userRepo.GetAllAsync();
        int totalCustomers = allUsers.Count(u => u.Role == UserRole.Customer);

        // ACTIVE POLICIES = legacy Active policies + converted quotes
        int legacyActiveCount = legacyPolicies.Count(p =>
            p.Status.Equals("Active", StringComparison.OrdinalIgnoreCase));
        int quoteActiveCount = activePolicyQuotes.Count;
        int totalActivePolicies = legacyActiveCount + quoteActiveCount;

        // TOTAL REVENUE = sum of all monthly premiums from both sources
        // (represents the recurring monthly income)
        decimal legacyRevenue = legacyPolicies
            .Where(p => p.Status.Equals("Active", StringComparison.OrdinalIgnoreCase))
            .Sum(p => p.MonthlyPremium);
        decimal quoteRevenue = activePolicyQuotes.Sum(q => q.CalculatedMonthlyPremium);
        decimal totalRevenue = legacyRevenue + quoteRevenue;

        // PENDING CLAIMS = claims awaiting officer decision
        int pendingClaimsCount = claims.Count(c =>
            c.Status.Equals("PendingApproval", StringComparison.OrdinalIgnoreCase));

        // TOTAL PAYOUTS (claims) = sum of all approved claim amounts disbursed so far
        decimal totalPayouts = claims
            .Where(c => c.Status.Equals("Approved", StringComparison.OrdinalIgnoreCase))
            .Sum(c => c.ClaimAmount);

        // UNPAID COMMISSIONS = agent commissions not yet disbursed
        decimal unpaidCommissions = commissions
            .Where(a => a.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase))
            .Sum(a => a.EarnedAmount);
            
        // AGENT PAYOUTS = total commissions earned mapped by agent id
        var agentPayouts = commissions
            .GroupBy(c => c.AgentId)
            .Select(g => new { 
                AgentId = g.Key, 
                TotalEarned = g.Sum(c => c.EarnedAmount) 
            })
            .ToDictionary(k => k.AgentId.ToString(), v => v.TotalEarned);

        // DOCUMENTS TO VERIFY = user documents pending admin/agent review
        int documentsToVerify = docs.Count(d =>
            d.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase));

        int totalActionLogs = (await _auditRepo.GetAllAsync()).Count();

        return new Dictionary<string, object>
        {
            { "totalActivePolicies", totalActivePolicies },
            { "totalRevenue", totalRevenue },
            { "pendingClaimsCount", pendingClaimsCount },
            { "totalPayouts", totalPayouts },
            { "unpaidCommissions", unpaidCommissions },
            { "agentPayouts", agentPayouts },
            { "documentsToVerify", documentsToVerify },
            { "totalCustomers", totalCustomers },
            { "totalActionLogs", totalActionLogs }
        };
    }
}

