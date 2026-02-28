using HealthInsurance.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HealthInsurance.Domain.Entities;

namespace HealthInsurance.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class StaffController : ControllerBase
    {
        private readonly IGenericRepository<Claim> _claimRepo;
        private readonly IGenericRepository<Policy> _policyRepo;
        private readonly IGenericRepository<PolicyActionLog> _auditRepo;

        public StaffController(IGenericRepository<Claim> claimRepo, IGenericRepository<Policy> policyRepo, IGenericRepository<PolicyActionLog> auditRepo)
        {
            _claimRepo = claimRepo;
            _policyRepo = policyRepo;
            _auditRepo = auditRepo;
        }

        // 9. Policy Verification (Agent)
        [HttpPatch("policy/verify/{id}")]
        public async Task<IActionResult> VerifyPolicy(int id, string status)
        {
            var policy = await _policyRepo.GetByIdAsync(id);
            if (policy == null) return NotFound();
            policy.Status = status; // e.g., "Verified"
            await _policyRepo.SaveChangesAsync();
            return Ok($"Policy {status}");
        }

        // 11. Accept/Reject Claims (Claim Officer)
        [HttpPatch("claim/decide/{id}")]
        public async Task<IActionResult> DecideClaim(int id, string status)
        {
            var claim = await _claimRepo.GetByIdAsync(id);
            if (claim == null) return NotFound();
            claim.Status = status; // "Approved" or "Rejected"
            await _claimRepo.SaveChangesAsync();
            return Ok($"Claim {status}");
        }

        // 10 & 12. History for Agent/Officer
        [HttpGet("history/{role}")]
        public async Task<IActionResult> GetStaffHistory(string role)
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
                ).OrderByDescending(l => l.CreatedAt);

                return Ok(agentHistory);
            }
            else if (role.ToLower() == "claimofficer")
            {
                // Claim Officers look at Claim submissions and final decisions
                var officerHistory = allLogs.Where(l =>
                    l.ActionType == "ClaimSubmission" ||
                    l.ActionType == "ClaimDecision"
                ).OrderByDescending(l => l.CreatedAt);

                return Ok(officerHistory);
            }

            return BadRequest("Invalid role. Please use 'agent' or 'claimofficer'.");
        }
    }
}
