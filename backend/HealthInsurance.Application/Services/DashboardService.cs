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
        var policies = (await _policyRepo.GetAllAsync()).Where(p => p.IsActive);
        var claims = await _claimRepo.GetAllAsync();
        var commissions = await _commissionRepo.GetAllAsync();
        var docs = await _docRepo.GetAllAsync();

        return new Dictionary<string, object>
        {
            { "TotalActivePolicies", policies.Count(p => p.Status == "Active") },
            { "TotalRevenue", policies.Sum(p => p.MonthlyPremium) },
            { "PendingClaimsCount", claims.Count(c => c.Status == "PendingApproval") },
            { "TotalPayouts", claims.Where(c => c.Status == "Approved").Sum(c => c.ClaimAmount) },
            { "UnpaidCommissions", commissions.Where(a => a.Status == "Pending").Sum(a => a.EarnedAmount) },
            { "DocumentsToVerify", docs.Count(d => d.Status == "Pending") }
        };
    }
}
