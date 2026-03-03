using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HealthInsurance.Application.Interfaces;
using HealthInsurance.Domain.Entities;

namespace HealthInsurance.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly IGenericRepository<HealthInsurance.Domain.Entities.Policy> _policyRepo;
    private readonly IGenericRepository<Claim> _claimRepo;
    private readonly IGenericRepository<AgentCommissionLog> _commissionRepo;
    private readonly IGenericRepository<DocumentVault> _docRepo;

    public DashboardService(
        IGenericRepository<Policy> policyRepo,
        IGenericRepository<Claim> claimRepo,
        IGenericRepository<AgentCommissionLog> commissionRepo,
        IGenericRepository<DocumentVault> docRepo)
    {
        _policyRepo = policyRepo;
        _claimRepo = claimRepo;
        _commissionRepo = commissionRepo;
        _docRepo = docRepo;
    }

    public async Task<Dictionary<string, object>> GetAdminStatsAsync()
    {
        // Only include policies that have not been soft-deleted
        var policies = (await _policyRepo.GetAllAsync()).Where(p => p.IsActive && p.UserId!=1);
        var claims = await _claimRepo.GetAllAsync();
        var commissions = await _commissionRepo.GetAllAsync();
        var docs = await _docRepo.GetAllAsync();

        return new Dictionary<string, object>
        {
            { "totalActivePolicies", policies.Count(p => p.Status.Equals("Active", StringComparison.OrdinalIgnoreCase)) },
            { "totalRevenue", policies.Sum(p => p.MonthlyPremium) },
            { "pendingClaimsCount", claims.Count(c => c.Status.Equals("PendingApproval", StringComparison.OrdinalIgnoreCase)) },
            { "totalPayouts", claims.Where(c => c.Status.Equals("Approved", StringComparison.OrdinalIgnoreCase)).Sum(c => c.ClaimAmount) },
            { "unpaidCommissions", commissions.Where(a => a.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase)).Sum(a => a.EarnedAmount) },
            { "documentsToVerify", docs.Count(d => d.Status.Equals("Pending", StringComparison.OrdinalIgnoreCase)) }
        };
    }
}
