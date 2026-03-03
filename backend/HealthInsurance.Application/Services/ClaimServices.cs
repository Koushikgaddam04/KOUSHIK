using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HealthInsurance.Application.Interfaces;
using HealthInsurance.Domain.Entities;

namespace HealthInsurance.Application.Services;

public class ClaimService : IClaimService
{
    private readonly IGenericRepository<HealthInsurance.Domain.Entities.Policy> _policyRepo;
    private readonly IGenericRepository<Claim> _claimRepo;
    private readonly IGenericRepository<PolicyActionLog> _auditRepo;

    public ClaimService(
        IGenericRepository<HealthInsurance.Domain.Entities.Policy> policyRepo,
        IGenericRepository<Claim> claimRepo,
        IGenericRepository<PolicyActionLog> auditRepo)
    {
        _policyRepo = policyRepo;
        _claimRepo = claimRepo;
        _auditRepo = auditRepo;
    }

    public async Task<string> ProcessClaimAsync(int policyId, decimal requestedAmount, string reason)
    {
        // 1. Validate Policy Existence and Status
        var policy = await _policyRepo.GetByIdAsync(policyId);

        if (policy == null || !policy.IsActive) // Check if policy is null OR soft-deleted
            return "Rejected: Policy record is inactive or does not exist.";

        if (policy.Status != "Active")
            return $"Rejected: Policy is currently {policy.Status}. Only 'Active' policies can file claims.";

        // Since TierName is removed from Policy, we use a default coverage percentage (e.g. 100%)
        // Real-world: This would be determined by the plan or other factors in the contract.
        decimal coveragePercentage = 1.0m;

        decimal calculatedPayout = requestedAmount * coveragePercentage;

        // 3. Check for Remaining Coverage Limits
        if (calculatedPayout > policy.CoverageAmount)
        {
            return $"Rejected: Calculated payout (${calculatedPayout}) exceeds remaining policy limit (${policy.CoverageAmount}).";
        }

        // 4. Create the Claim Record
        var claim = new Claim
        {
            PolicyId = policyId,
            UserId = policy.UserId,
            ClaimAmount = calculatedPayout,
            Reason = reason,
            Status = "PendingApproval",
            IsActive = true
        };

        await _claimRepo.AddAsync(claim);

        // 5. [DEDUCTION MOVED TO APPROVAL STAGE]
        // policy.CoverageAmount -= calculatedPayout;
        // _policyRepo.Update(policy);

        // 6. Audit Logging: Track the Claim Creation
        var log = new PolicyActionLog
        {
            EntityName = "Claim",
            EntityRecordId = policyId,
            ActionType = "ClaimSubmission",
            OldValue = policy.CoverageAmount.ToString(),
            NewValue = (policy.CoverageAmount - calculatedPayout).ToString(),
            Reason = $"User requested {requestedAmount}. System approved {calculatedPayout} based on policy coverage rules.",
            PerformedByUserId = policy.UserId // Initial submission by customer
        };
        await _auditRepo.AddAsync(log);

        // 7. Commit Transaction
        //var success = await _claimRepo.SaveChangesAsync();
        var success = false;
        try
        {
            success = await _claimRepo.SaveChangesAsync();
        }
        catch (Exception ex)
        {
            // Put a breakpoint here! 
            // Hover over 'ex' and look at 'InnerException'
            var message = ex.InnerException?.Message;
            throw;
        }

        if (success)
        {
            return $"Success: Claim submitted for ${calculatedPayout}. Your remaining coverage is now ${policy.CoverageAmount}.";
        }

        return "Error: System failed to process the claim. Please try again later.";
    }
}