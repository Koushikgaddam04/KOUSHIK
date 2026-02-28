using HealthInsurance.Application.Interfaces;
using HealthInsurance.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
namespace HealthInsurance.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class PolicyController : ControllerBase
{
    private readonly IPolicyService _policyService;
    private readonly IGenericRepository<Policy> _policyRepo;
    private readonly IGenericRepository<PolicyActionLog> _auditRepo;

    public PolicyController(
        IPolicyService policyService,
        IGenericRepository<Policy> policyRepo,
        IGenericRepository<PolicyActionLog> auditRepo)
    {
        _policyService = policyService;
        _policyRepo = policyRepo;
        _auditRepo = auditRepo;
    }

    // 1. Activate Policy (Quote -> Policy Conversion)
    [HttpPost("activate")]
    public async Task<IActionResult> Activate(string quoteRef, int customerId)
    {
        var result = await _policyService.ActivatePolicyAsync(quoteRef, customerId);
        if (!result) return BadRequest("Could not activate policy. Invalid quote or already converted.");

        return Ok("Policy activated successfully! Commission and Audit logs updated.");
    }

    // 3. See recent policies (Admin) - Duplicate removed, kept this version
    [HttpGet("recent")]
    public async Task<IActionResult> GetRecentPolicies()
    {
        var policies = await _policyRepo.GetAllAsync();
        var activePolicies = policies.Where(p => p.IsActive)
                                 .OrderByDescending(p => p.CreatedAt)
                                 .Take(10);
        return Ok(activePolicies);
    }

    // 4. Create Policy (Direct Admin Creation)
    [HttpPost("create")]
    public async Task<IActionResult> CreatePolicy([FromBody] Policy policy)
    {
        await _policyRepo.AddAsync(policy);
        await _policyRepo.SaveChangesAsync();
        return Ok(policy);
    }

    // 5. Assign Agent to a Customer
    [HttpPatch("assign-agent")]
    public async Task<IActionResult> AssignAgent(int policyId, int agentId)
    {
        var policy = await _policyRepo.GetByIdAsync(policyId);
        if (policy == null) return NotFound();

        var log = new PolicyActionLog
        {
            EntityName = "Policy",
            EntityRecordId = policyId,
            ActionType = "AgentAssignment",
            NewValue = $"Agent ID: {agentId}",
            PerformedByUserId = 1 // Placeholder for Admin ID
        };
        await _auditRepo.AddAsync(log);
        await _auditRepo.SaveChangesAsync();
        return Ok("Agent assigned successfully.");
    }

    // 6. Request for a Policy (Customer functionality)
    [HttpPost("request")]
    public async Task<IActionResult> RequestPolicy(int userId, string planName, string tier)
    {
        // This logs a request in the audit trail for Agents to see
        var log = new PolicyActionLog
        {
            EntityName = "PolicyRequest",
            EntityRecordId = userId,
            ActionType = "NewRequest",
            NewValue = $"Plan: {planName}, Tier: {tier}",
            PerformedByUserId = userId
        };
        await _auditRepo.AddAsync(log);
        await _auditRepo.SaveChangesAsync();
        return Ok("Your policy request has been submitted for verification.");
    }

    // 13. Soft Delete Policy (Admin)
    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDeletePolicy(int id)
    {
        var policy = await _policyRepo.GetByIdAsync(id);

        if (policy == null)
            return NotFound($"Policy with ID {id} not found.");

        // Soft delete: just flip the flag
        policy.IsActive = false;
        policy.Status = "Cancelled";

        // Log this major action in the audit trail
        var log = new PolicyActionLog
        {
            EntityName = "Policy",
            EntityRecordId = id,
            ActionType = "SoftDelete",
            OldValue = "Active",
            NewValue = "Inactive/Cancelled",
            Reason = "Admin initiated soft delete.",
            PerformedByUserId = 1 // Admin ID
        };

        await _auditRepo.AddAsync(log);
        _policyRepo.Update(policy);
        await _policyRepo.SaveChangesAsync();

        return Ok(new { Message = $"Policy {id} has been soft-deleted (deactivated)." });
    }
}