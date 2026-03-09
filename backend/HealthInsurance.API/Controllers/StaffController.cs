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

        [HttpGet("claims-officers")]
        public async Task<IActionResult> GetClaimsOfficers()
        {
            var allUsers = await _userRepo.GetAllAsync();
            var officers = allUsers
                .Where(u => u.Role == HealthInsurance.Domain.Enums.UserRole.ClaimsOfficer)
                .Select(u => new
                {
                    id = u.Id,
                    name = u.FullName
                })
                .ToList();

            return Ok(officers);
        }

        [HttpGet("all")]
        public async Task<IActionResult> GetAllStaff()
        {
            var allUsers = await _userRepo.GetAllAsync();
            var staff = allUsers
                .Where(u => u.Role == HealthInsurance.Domain.Enums.UserRole.Agent || u.Role == HealthInsurance.Domain.Enums.UserRole.ClaimsOfficer)
                .Select(u => new
                {
                    id = u.Id,
                    fullName = u.FullName,
                    email = u.Email,
                    role = u.Role.ToString(),
                    createdAt = u.CreatedAt
                })
                .ToList();

            return Ok(staff);
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
            var allUsers = await _userRepo.GetAllAsync();

            var pendingQueue = allQuotes
                .Where(q => q.IsConvertedToPolicy == 0 && q.IsPaid == true)
                .Select(q => {
                    var user = allUsers.FirstOrDefault(u => u.Id == q.UserId);
                    return new {
                        id = q.Id,
                        userId = q.UserId ?? 0,
                        quoteReference = q.QuoteReference,
                        customerName = user != null ? user.FullName : "Customer " + q.UserId,
                        customerEmail = user != null ? user.Email : "customer@example.com",
                        planName = q.SelectedPlanName,
                        tier = q.SelectedTierName,
                        createdAt = q.CreatedAt
                    };
                })
                .ToList();

            return Ok(pendingQueue);
        }

        // 9. Policy Verification/Rejection (Agent)
        [HttpPatch("policy/verify/{id}")]
        public async Task<IActionResult> VerifyPolicy([FromRoute] int id, [FromQuery] string status)
        {
            var quote = await _quoteRepo.GetByIdAsync(id);
            if (quote == null) return NotFound("Pending quote request not found.");

            bool success;
            if (status?.ToLower() == "reject")
            {
                success = await _policyService.RejectPolicyAsync(quote.QuoteReference);
                if (!success) return BadRequest("Failed to reject the policy.");
                return Ok("Customer policy request rejected. Refund process initiated.");
            }
            else
            {
                success = await _policyService.ActivatePolicyAsync(quote.QuoteReference, quote.UserId ?? 0);
                if (!success) return BadRequest("Failed to verify and activate the policy.");
                return Ok("Customer quote verified and policy activated successfully.");
            }
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

            // If approving, deduct from the correct coverage source
            if (status == "Approved" && claim.Status != "Approved")
            {
                decimal currentCoverage = 0;
                string coverageSource = "";

                // Determine which source to deduct from
                Policy? policy = null;
                PremiumQuote? quote = null;

                if (claim.PolicyId.HasValue && claim.PolicyId.Value > 0)
                {
                    policy = await _policyRepo.GetByIdAsync(claim.PolicyId.Value);
                    if (policy != null) { currentCoverage = policy.CoverageAmount; coverageSource = "Policy"; }
                }
                else if (claim.PremiumQuoteId.HasValue && claim.PremiumQuoteId.Value > 0)
                {
                    quote = await _quoteRepo.GetByIdAsync(claim.PremiumQuoteId.Value);
                    if (quote != null) { currentCoverage = quote.CoverageAmount; coverageSource = "PremiumQuote"; }
                }

                // Safety check — only block if we found a source AND it's insufficient
                if ((policy != null || quote != null) && currentCoverage < claim.ClaimAmount)
                {
                    claim.Status = "Rejected";
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
                        Message = $"Insufficient Funds: {coverageSource} only has ${currentCoverage} remaining. Claim #{claim.Id} was for ${claim.ClaimAmount}. The claim has been automatically rejected."
                    });
                }

                // Perform actual deduction on the correct source
                if (policy != null)
                {
                    policy.CoverageAmount -= claim.ClaimAmount;
                    _policyRepo.Update(policy);
                    await _auditRepo.AddAsync(new PolicyActionLog
                    {
                        EntityName = "Policy",
                        EntityRecordId = policy.Id,
                        ActionType = "ClaimApprovalDeduction",
                        NewValue = $"Remaining: {policy.CoverageAmount}",
                        Reason = $"Deducted ${claim.ClaimAmount} for Claim #{claim.Id}",
                        PerformedByUserId = UserSession.CurrentUserId
                    });
                }
                else if (quote != null)
                {
                    quote.CoverageAmount -= claim.ClaimAmount;
                    _quoteRepo.Update(quote);
                    await _auditRepo.AddAsync(new PolicyActionLog
                    {
                        EntityName = "PremiumQuote",
                        EntityRecordId = quote.Id,
                        ActionType = "ClaimApprovalDeduction",
                        NewValue = $"Remaining: {quote.CoverageAmount}",
                        Reason = $"Deducted ${claim.ClaimAmount} for Claim #{claim.Id}",
                        PerformedByUserId = UserSession.CurrentUserId
                    });
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
                ).OrderByDescending(l => l.CreatedAt)
                .Select(l => new {
                    id = l.Id,
                    policyId = l.EntityRecordId != 0 ? l.EntityRecordId.ToString() : "N/A",
                    actionDetails = l.ActionType,
                    date = l.CreatedAt,
                    newValue = l.NewValue,
                    reason = l.Reason
                })
                .ToList();

                return Ok(agentHistory);
            }
            else if (role.ToLower() == "claimofficer" || role.ToLower() == "officer")
            {
                // Claim Officers look at Claim submissions and final decisions
                var officerHistory = allLogs.Where(l =>
                    l.ActionType == "ClaimSubmission" ||
                    l.ActionType == "ClaimDecision" ||
                    l.ActionType == "ClaimApprovalDeduction"
                ).OrderByDescending(l => l.CreatedAt)
                .Select(l => new {
                    id = l.Id,
                    claimReference = l.EntityRecordId != 0 ? "Claim #" + l.EntityRecordId : "Unknown",
                    actionTaken = l.NewValue ?? l.ActionType,
                    dateTime = l.CreatedAt
                })
                .ToList();

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
