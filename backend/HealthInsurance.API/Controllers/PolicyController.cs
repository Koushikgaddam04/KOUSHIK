using HealthInsurance.Application.Interfaces;
using HealthInsurance.Domain.Entities;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using HealthInsurance.Domain;

namespace HealthInsurance.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PolicyController : BaseApiController
{
    private readonly IPolicyService _policyService;
    private readonly IGenericRepository<Policy> _policyRepo;
    private readonly IGenericRepository<PolicyActionLog> _auditRepo;
    private readonly IGenericRepository<PremiumQuote> _quoteRepo;

    public PolicyController(
        IPolicyService policyService,
        IGenericRepository<Policy> policyRepo,
        IGenericRepository<PolicyActionLog> auditRepo,
        IGenericRepository<PremiumQuote> quoteRepo)
    {
        _policyService = policyService;
        _policyRepo = policyRepo;
        _auditRepo = auditRepo;
        _quoteRepo = quoteRepo;
    }

    // New Endpoint: Get only policies for the logged-in customer (+ converted quotes)
    [HttpGet("customer")]
    public async Task<IActionResult> GetMyDashboardPolicies()
    {
        var userId = UserSession.CurrentUserId;
        
        // 1. Get real policy objects
        var allPolicies = await _policyRepo.GetAllAsync();
        var policies = allPolicies.Where(p => p.UserId == userId).ToList();

        // 2. Get converted quotes (as requested: IsConvertedToPolicy = true)
        var quotes = await _quoteRepo.GetAllAsync();
        var convertedQuotes = quotes.Where(q => q.UserId == userId && q.IsConvertedToPolicy == true).ToList();

        // We combine them for the UI to display in the same "Policies" list
        // Using common property names expected by the UI part: id, planName, status, premium, coverageAmount
        var dashboardList = policies
        .Select(p => new {
            Id = p.Id,
            PlanName = p.PlanName,
            Status = p.Status,
            Premium = p.MonthlyPremium,
            MonthlyPremium = p.MonthlyPremium,
            CoverageAmount = p.CoverageAmount,
            ExpiryDate = p.ExpiryDate,
            PolicyNumber = p.PolicyNumber
        }).ToList();

        foreach (var q in convertedQuotes)
        {
            // Avoid adding duplicates if already in the policy table
            if (!dashboardList.Any(d => d.PlanName == q.SelectedPlanName && d.MonthlyPremium == q.CalculatedMonthlyPremium))
            {
                dashboardList.Add(new {
                    Id = q.Id,
                    PlanName = q.SelectedPlanName,
                    Status = "Active",
                    Premium = q.CalculatedMonthlyPremium,
                    MonthlyPremium = q.CalculatedMonthlyPremium,
                    CoverageAmount = q.CoverageAmount,
                    ExpiryDate = q.ExpiryDate,
                    PolicyNumber = q.QuoteReference
                });
            }
        }

        return Ok(dashboardList);
    }


    // 1. Activate Policy (Quote -> Policy Conversion)
    [HttpPost("activate")]
    public async Task<IActionResult> Activate([FromQuery] string quoteRef, [FromQuery] int customerId)
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
        var activeTemplates = policies.Where(p => p.IsActive && p.IsPlanTemplate)
                                 .OrderByDescending(p => p.CreatedAt)
                                 .Take(10);
        return Ok(activeTemplates);
    }

    // 4. Create Policy (Direct Admin Creation)
    [HttpPost("create")]
    public async Task<IActionResult> CreatePolicy([FromBody] Policy policy)
    {
        policy.PolicyNumber = "POL-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper();
        policy.UserId = 1; // Admin attribution
        policy.IsPlanTemplate = true; // Admin created policies are templates

        await _policyRepo.AddAsync(policy);
        await _policyRepo.SaveChangesAsync();
        return Ok(policy);
    }

    // 5. Assign Agent to a Customer
    [HttpPatch("assign-agent")]
    public async Task<IActionResult> AssignAgent([FromQuery] int policyId, [FromQuery] int agentId)
    {
        var policy = await _policyRepo.GetByIdAsync(policyId);
        if (policy == null) return NotFound();

        // **CRITICAL FIX**: Save the assigned Agent ID to the actual Policy database Row
        policy.AgentId = agentId;
        _policyRepo.Update(policy);
        await _policyRepo.SaveChangesAsync();

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
    public async Task<IActionResult> RequestPolicy([FromQuery] int userId, [FromQuery] string planName, [FromQuery] string tier)
    {
        // 1. Actually create the pending policy for agents to see
        var pendingPolicy = new Policy
        {
            UserId = userId,
            PolicyNumber = "REQ-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper(),
            PlanName = planName,

            MonthlyPremium = 0, // TBD by agent or standard
            CoverageAmount = 0, // TBD by agent or standard
            ExpiryDate = DateTime.UtcNow.AddYears(1), // Default 1 year 
            Status = "Pending",
            IsActive = false
        };

        await _policyRepo.AddAsync(pendingPolicy);
        await _policyRepo.SaveChangesAsync(); // generate ID

        // This logs a request in the audit trail for Agents to see
        var log = new PolicyActionLog
        {
            EntityName = "PolicyRequest",
            EntityRecordId = pendingPolicy.Id,
            ActionType = "NewRequest",
            NewValue = $"Plan: {planName}",
            PerformedByUserId = userId
        };
        await _auditRepo.AddAsync(log);
        await _auditRepo.SaveChangesAsync();
        return Ok("Your policy request has been submitted for verification.");
    }

    // 13. Soft Delete Policy (Admin)
    [HttpDelete("{id}")]
    public async Task<IActionResult> SoftDeletePolicy([FromRoute] int id)
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
