using HealthInsurance.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HealthInsurance.Domain.Entities;
using HealthInsurance.Domain;

namespace HealthInsurance.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffController : BaseApiController
    {
        private readonly IGenericRepository<Claim> _claimRepo;
        private readonly IGenericRepository<Policy> _policyRepo;
        private readonly IGenericRepository<PolicyActionLog> _auditRepo;
        private readonly IGenericRepository<User> _userRepo;
        private readonly IGenericRepository<PremiumQuote> _quoteRepo;
        private readonly IPolicyService _policyService;

        public StaffController(
            IGenericRepository<Claim> claimRepo, 
            IGenericRepository<Policy> policyRepo, 
            IGenericRepository<PolicyActionLog> auditRepo,
            IGenericRepository<User> userRepo,
            IGenericRepository<PremiumQuote> quoteRepo,
            IPolicyService policyService)
        {
            _claimRepo = claimRepo;
            _policyRepo = policyRepo;
            _auditRepo = auditRepo;
            _userRepo = userRepo;
            _quoteRepo = quoteRepo;
            _policyService = policyService;
        }

        // Add agents endpoint for Manage Policies
        [HttpGet("agents")]
        public async Task<IActionResult> GetAgents()
        {
            var allUsers = await _userRepo.GetAllAsync();
            var agents = allUsers
                .Where(u => u.Role == HealthInsurance.Domain.Enums.UserRole.Agent)
                .Select(u => new
                {
                    id = u.Id,
                    name = u.FullName
                })
                .ToList();

            return Ok(agents);
        }

        // 8. Get Pending Policies (Agent Queue)
        [HttpGet("policy/pending")]
        public async Task<IActionResult> GetPendingPolicies([FromQuery] int agentId)
        {
            // 1. Get the list of Plan Names this specific Agent is responsible for
            var allPolicies = await _policyRepo.GetAllAsync();
            var agentAssignedPlanNames = allPolicies
                .Where(p => p.AgentId == agentId && p.IsActive)
                .Select(p => p.PlanName)
                .Distinct()
                .ToList();

            // 2. Fetch Quotes that are converted (IsConvertedToPolicy = 1) 
            // AND match the agent's assigned plans
            var allQuotes = await _quoteRepo.GetAllAsync();

            var pendingQueue = allQuotes
                .Where(q => q.IsConvertedToPolicy == false && q.IsPaid == true)
                .Select(q => new
                {
                    id = q.Id,
                    userId = q.UserId ?? 0,
                    customerName = q.User != null ? q.User.FullName : "Customer " + q.UserId,
                    customerEmail = q.User != null ? q.User.Email : "customer@example.com",
                    planName = q.SelectedPlanName,
                    tier = q.SelectedTierName,
                    createdAt = q.CreatedAt
                })
                .ToList();

            return Ok(pendingQueue);
        }

        // 9. Policy Verification (Agent)
        [HttpPatch("policy/verify/{id}")]
        public async Task<IActionResult> VerifyPolicy([FromRoute] int id, [FromQuery] string status)
        {
            var quote = await _quoteRepo.GetByIdAsync(id);
            if (quote == null) return NotFound("Pending quote request not found.");

            // Securely transfer this Quote into an Active Policy using the central service logic!
            var success = await _policyService.ActivatePolicyAsync(quote.QuoteReference, quote.UserId ?? 0);
            
            if (!success) return BadRequest("Failed to verify and activate the policy.");
            
            return Ok($"Customer quote verified and policy activated successfully.");
        }
        // 10. Get Pending Claims (Claim Officer Queue)
        [HttpGet("claim/pending")]
        public async Task<IActionResult> GetPendingClaims()
        {
            var allClaims = await _claimRepo.GetAllAsync();
            var pendingClaims = allClaims
                .Where(c => c.Status == "PendingApproval")
                .Select(c => new
                {
                    id = c.Id,
                    policyId = c.PolicyId,
                    userId = c.UserId,
                    amount = c.ClaimAmount,
                    reason = c.Reason
                })
                .ToList();

            return Ok(pendingClaims);
        }

        // 11. Accept/Reject Claims (Claim Officer)
        [HttpPatch("claim/decide/{id}")]
        public async Task<IActionResult> DecideClaim([FromRoute] int id, [FromQuery] string status)
        {
            var claim = await _claimRepo.GetByIdAsync(id);
            if (claim == null) return NotFound();

            // If approving, deduct from policy coverage
            if (status == "Approved" && claim.Status != "Approved")
            {
                var policy = await _policyRepo.GetByIdAsync(claim.PolicyId);
                if (policy != null)
                {
                    // SAFETY CHECK: Prevent negative coverage
                    if (policy.CoverageAmount < claim.ClaimAmount)
                    {
                        claim.Status = "Rejected";
                        
                        // Log the automatic rejection
                        var errorLog = new PolicyActionLog
                        {
                            EntityName = "Claim",
                            EntityRecordId = claim.Id,
                            ActionType = "ClaimDecision",
                            NewValue = "Rejected",
                            Reason = "Policy Violation: Insufficient Coverage Amount",
                            PerformedByUserId = UserSession.CurrentUserId
                        };
                        await _auditRepo.AddAsync(errorLog);
                        
                        await _claimRepo.SaveChangesAsync();
                        return BadRequest(new { 
                            Message = $"Insufficient Funds: Policy only has ${policy.CoverageAmount} remaining. Claim #{claim.Id} was for ${claim.ClaimAmount}. The claim has been automatically rejected." 
                        });
                    }

                    policy.CoverageAmount -= claim.ClaimAmount;
                    _policyRepo.Update(policy);

                    // Add Audit Log for the deduction
                    var log = new PolicyActionLog
                    {
                        EntityName = "Policy",
                        EntityRecordId = policy.Id,
                        ActionType = "ClaimApprovalDeduction",
                        NewValue = $"Remaining: {policy.CoverageAmount}",
                        Reason = $"Deducted ${claim.ClaimAmount} for Claim #{claim.Id}",
                        PerformedByUserId = UserSession.CurrentUserId // Admin/Officer ID
                    };
                    await _auditRepo.AddAsync(log);
                }
            }

            // Always log the final decision
            var decisionLog = new PolicyActionLog
            {
                EntityName = "Claim",
                EntityRecordId = claim.Id,
                ActionType = "ClaimDecision",
                NewValue = status,
                Reason = status == "Rejected" ? "Rejected by Claims Officer" : $"Approved for amount ${claim.ClaimAmount}",
                PerformedByUserId = UserSession.CurrentUserId
            };
            await _auditRepo.AddAsync(decisionLog);

            claim.Status = status; // "Approved" or "Rejected"
            await _claimRepo.SaveChangesAsync();
            return Ok(new { Message = $"Claim {id} marked as {status}. Coverage updated if approved." });
        }

        // 10 & 12. History for Agent/Officer
        [HttpGet("history/{role}")]
        public async Task<IActionResult> GetStaffHistory([FromRoute] string role)
        {
            // 1. Fetch all logs from the Audit Repository
            var allLogs = await _auditRepo.GetAllAsync();

            // 2. Filter based on the role and the ActionType
            if (role.ToLower() == "agent")
            {
                // Agents look at Policy requests, assignments, and verifications
                var agentHistory = allLogs.Where(l =>
                    l.ActionType == "PolicyVerification" ||
                    l.ActionType == "AgentAssignment" ||
                    l.ActionType == "DocumentReview"
                ).OrderByDescending(l => l.CreatedAt).ToList();

                return Ok(agentHistory);
            }
            else if (role.ToLower() == "claimofficer")
            {
                // Claim Officers look at Claim submissions and final decisions
                var officerHistory = allLogs.Where(l =>
                    l.ActionType == "ClaimSubmission" ||
                    l.ActionType == "ClaimDecision" ||
                    l.ActionType == "ClaimApprovalDeduction"
                ).OrderByDescending(l => l.CreatedAt).ToList();

                return Ok(officerHistory);
            }

            return BadRequest("Invalid role. Please use 'agent' or 'claimofficer'.");
        }

        [HttpGet("my-verification-queue/{agentId}")]
        public async Task<IActionResult> GetAgentQueue([FromRoute] int agentId)
        {
            // 1. Get all policies
            var allPolicies = await _policyRepo.GetAllAsync();
            var myQueue = allPolicies.Where(p =>
                p.AgentId == agentId &&
                p.IsActive == true
            ).ToList();

            return Ok(myQueue);
        }
    }
}
