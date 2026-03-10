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
    private readonly IQuoteRepository _quoteRepo;
    private readonly IGenericRepository<Claim> _claimRepo;
    private readonly IGenericRepository<PolicyActionLog> _auditRepo;
    private readonly IGenericRepository<HealthInsurance.Domain.Entities.Policy> _policyRepo;

    public ClaimService(
        IGenericRepository<HealthInsurance.Domain.Entities.Policy> policyRepo,
        IQuoteRepository quoteRepo,
        IGenericRepository<Claim> claimRepo,
        IGenericRepository<PolicyActionLog> auditRepo)
    {
        _policyRepo = policyRepo;
        _quoteRepo = quoteRepo;
        _claimRepo = claimRepo;
        _auditRepo = auditRepo;
    }

    public async Task<(string Message, int ClaimId)> ProcessClaimAsync(int policyId, decimal requestedAmount, string reason, int callerUserId)
    {
        // 1. Try to find in Legacy Policies first
        var legacyPolicy = await _policyRepo.GetByIdAsync(policyId);
        
        int? realPolicyId = null;
        int? realQuoteId = null;
        int userId = 0;
        decimal coverageLimit = 0;
        string policyRef = "";

        if (legacyPolicy != null && legacyPolicy.IsActive && legacyPolicy.Status == "Active")
        {
            realPolicyId = legacyPolicy.Id;
            userId = legacyPolicy.UserId;
            coverageLimit = legacyPolicy.CoverageAmount;
            policyRef = legacyPolicy.PolicyNumber;
        }
        else
        {
            // 2. Try to find in PremiumQuotes (The new Policy source)
            var quotePolicy = await _quoteRepo.GetByIdAsync(policyId);
            if (quotePolicy != null && quotePolicy.IsActive && quotePolicy.IsConvertedToPolicy == 1)
            {
                realQuoteId = quotePolicy.Id;
                userId = quotePolicy.UserId ?? 0;
                coverageLimit = quotePolicy.CoverageAmount;
                policyRef = quotePolicy.QuoteReference;
            }
        }

        if (realPolicyId == null && realQuoteId == null)
            return ("Rejected: No active policy found with that ID.", 0);

        // 3. Calculation
        decimal calculatedPayout = requestedAmount; // Simple 100% coverage for now

        if (calculatedPayout > coverageLimit)
        {
            return ($"Rejected: Payout (${calculatedPayout}) exceeds coverage limit (${coverageLimit}).", 0);
        }

        // 4. Create Claim Record
        // Always use callerUserId (from JWT) as the claim owner — NOT the policy's UserId
        // This ensures GetClaimsByUserId correctly returns this claim for the logged-in customer.
        var claim = new Claim
        {
            PolicyId = realPolicyId,
            PremiumQuoteId = realQuoteId,
            UserId = callerUserId > 0 ? callerUserId : userId,
            ClaimAmount = calculatedPayout,
            Reason = reason,
            Status = "PendingApproval"
        };

        await _claimRepo.AddAsync(claim);

        // 5. Audit — use callerUserId for the FK (guaranteed valid from JWT)
        int auditUserId = callerUserId > 0 ? callerUserId : userId;
        if (auditUserId > 0)
        {
            var log = new PolicyActionLog
            {
                EntityName = realPolicyId.HasValue ? "Policy" : "PremiumQuote",
                EntityRecordId = policyId,
                ActionType = "ClaimSubmission",
                NewValue = calculatedPayout.ToString(),
                PerformedByUserId = auditUserId
            };
            await _auditRepo.AddAsync(log);
        }

        var success = await _claimRepo.SaveChangesAsync();
        
        if (success)
            return ($"Success: Claim submitted for ${calculatedPayout} against policy {policyRef}.", claim.Id);

        return ("Error: Failed to save claim.", 0);
    }

    public async Task<IEnumerable<Claim>> GetClaimsByUserIdAsync(int userId)
    {
        var allClaims = await _claimRepo.GetAllAsync();
        return allClaims.Where(c => c.UserId == userId).ToList();
    }
}