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
    private readonly IGenericRepository<User> _userRepo;
    private readonly IGenericRepository<PolicyActionLog> _auditRepo;
    private readonly IGenericRepository<PremiumQuote> _quoteRepo;

    public PolicyController(
        IPolicyService policyService,
        IGenericRepository<Policy> policyRepo,
        IGenericRepository<User> userRepo,
        IGenericRepository<PolicyActionLog> auditRepo,
        IGenericRepository<PremiumQuote> quoteRepo)
    {
        _policyService = policyService;
        _policyRepo = policyRepo;
        _userRepo = userRepo;
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

        var allUsers = await _userRepo.GetAllAsync();

        // 1. Convert legacy policies to the common display format
        var dashboardList = policies.Select(p => {
            var agent = allUsers.FirstOrDefault(u => u.Id == p.AgentId);
            var officer = allUsers.FirstOrDefault(u => u.Id == p.ClaimsOfficerId);
            return new {
                Id = p.Id,
                PlanName = p.PlanName,
                Status = p.Status,
                Premium = p.MonthlyPremium,
                MonthlyPremium = p.MonthlyPremium,
                CoverageAmount = p.CoverageAmount,
                ExpiryDate = p.ExpiryDate,
                CreatedAt = p.CreatedAt,
                PolicyNumber = p.PolicyNumber,
                AgentName = agent?.FullName ?? "Not Assigned",
                ClaimsOfficerName = officer?.FullName ?? "Not Assigned",
                FamilySize = p.FamilySize,
                PreExistingConditions = p.PreExistingConditions,
                IsPorting = p.IsPorting
            };
        }).ToList<dynamic>();

        // 2. Get PremiumQuotes that are now acting as policies or are in progress
        var quotes = await _quoteRepo.GetAllAsync();
        var myQuotes = quotes.Where(q => q.UserId == userId).ToList();

        foreach (var q in myQuotes)
        {
            // Only add if it's either an active policy (1) or a pending paid request (0) or rejected (2)
            // But usually we show them in different sections. 
            // For this consolidated list, we'll label them by status.
            
            string status = "";
            if (q.IsConvertedToPolicy == 1 && q.IsPaid) status = "Active";
            else if (q.IsConvertedToPolicy == 1 && !q.IsPaid) status = "Payment Pending";
            else if (q.IsConvertedToPolicy == 2) status = "Rejected";
            else if (q.IsConvertedToPolicy == 0) status = "Pending Review";

            var agent = allUsers.FirstOrDefault(u => u.Id == q.AgentId);
            var officer = allUsers.FirstOrDefault(u => u.Id == q.ClaimsOfficerId);

            dashboardList.Add(new {
                Id = q.Id,
                PlanName = q.SelectedPlanName,
                Status = status,
                Premium = q.CalculatedMonthlyPremium,
                MonthlyPremium = q.CalculatedMonthlyPremium,
                CoverageAmount = q.CoverageAmount,
                ExpiryDate = q.ExpiryDate,
                CreatedAt = q.CreatedAt,
                PolicyNumber = q.QuoteReference,
                AgentName = agent?.FullName ?? (status == "Pending" ? "Processing" : "Not Assigned"),
                ClaimsOfficerName = officer?.FullName ?? (status == "Pending" ? "Processing" : "Not Assigned"),
                FamilySize = q.FamilySize,
                PreExistingConditions = q.PreExistingConditions,
                IsPorting = q.IsPorting
            });
        }

        return Ok(dashboardList);
    }


    // 1. Activate Policy (Quote -> Policy Conversion)
    [HttpPost("activate")]
    public async Task<IActionResult> Activate([FromQuery] string quoteRef, [FromQuery] int customerId)
    {
        var result = await _policyService.ActivatePolicyAsync(quoteRef);
        if (!result) return BadRequest("Could not activate policy. Invalid quote or already converted.");

        return Ok("Policy activated successfully! Commission and Audit logs updated.");
    }

    [HttpGet("plans")]
    [AllowAnonymous] // Assuming we want anyone to see these plans to get a quote
    public async Task<IActionResult> GetPolicyPlans()
    {
        var policies = await _policyRepo.GetAllAsync();
        var templates = policies.Where(p => p.IsPlanTemplate && p.Status == "Active")
            .Select(p => new {
                p.Id,
                p.PlanName,
                p.PlanDescription,
                p.MonthlyPremium,
                p.CoverageAmount
            }).ToList();
        return Ok(templates);
    }

    // 3. See recent policies (Admin) - Duplicate removed, kept this version
    [HttpGet("recent")]
    public async Task<IActionResult> GetRecentPolicies()
    {
        var policies = await _policyRepo.GetAllAsync();
        // Show both active and inactive templates for Admin management
        var templates = policies.Where(p => p.IsPlanTemplate)
                                 .OrderByDescending(p => p.CreatedAt)
                                 .Take(10);
        return Ok(templates);
    }

    // 4. Create Policy (Direct Admin Creation)
    [HttpPost("create")]
    public async Task<IActionResult> CreatePolicy([FromBody] Policy policy)
    {
        policy.PolicyNumber = "POL-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper();
        policy.UserId = UserSession.CurrentUserId; // Dynamic Admin/User attribution
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

        if (policy.IsPlanTemplate && !string.IsNullOrEmpty(policy.PlanName))
        {
            var allQuotes = await _quoteRepo.GetAllAsync();
            var matchedQuotes = allQuotes.Where(q => q.SelectedPlanName == policy.PlanName).ToList();
            foreach (var q in matchedQuotes)
            {
                q.AgentId = agentId;
                _quoteRepo.Update(q);
            }
            if (matchedQuotes.Any()) await _quoteRepo.SaveChangesAsync();
        }

        var log = new PolicyActionLog
        {
            EntityName = "Policy",
            EntityRecordId = policyId,
            ActionType = "AgentAssignment",
            NewValue = $"Agent ID: {agentId}",
            PerformedByUserId = UserSession.CurrentUserId // Actual Admin/Agent ID
        };
        await _auditRepo.AddAsync(log);
        await _auditRepo.SaveChangesAsync();
        return Ok("Agent assigned successfully.");
    }

    [HttpPatch("assign-officer")]
    public async Task<IActionResult> AssignOfficer([FromQuery] int policyId, [FromQuery] int claimsOfficerId)
    {
        var policy = await _policyRepo.GetByIdAsync(policyId);
        if (policy == null) return NotFound();

        policy.ClaimsOfficerId = claimsOfficerId;
        _policyRepo.Update(policy);
        await _policyRepo.SaveChangesAsync();

        if (policy.IsPlanTemplate && !string.IsNullOrEmpty(policy.PlanName))
        {
            var allQuotes = await _quoteRepo.GetAllAsync();
            var matchedQuotes = allQuotes.Where(q => q.SelectedPlanName == policy.PlanName).ToList();
            foreach (var q in matchedQuotes)
            {
                q.ClaimsOfficerId = claimsOfficerId;
                _quoteRepo.Update(q);
            }
            if (matchedQuotes.Any()) await _quoteRepo.SaveChangesAsync();
        }

        var log = new PolicyActionLog
        {
            EntityName = "Policy",
            EntityRecordId = policyId,
            ActionType = "ClaimsOfficerAssignment",
            NewValue = $"Officer ID: {claimsOfficerId}",
            PerformedByUserId = UserSession.CurrentUserId
        };
        await _auditRepo.AddAsync(log);
        await _auditRepo.SaveChangesAsync();
        return Ok("Claims Officer assigned successfully.");
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
        policy.Status = "Inactive";

        // Log this major action in the audit trail
        var log = new PolicyActionLog
        {
            EntityName = "Policy",
            EntityRecordId = id,
            ActionType = "SoftDelete",
            OldValue = "Active",
            NewValue = "Inactive",
            Reason = "Admin initiated soft delete.",
            PerformedByUserId = UserSession.CurrentUserId // Admin ID
        };

        await _auditRepo.AddAsync(log);
        _policyRepo.Update(policy);
        await _policyRepo.SaveChangesAsync();

        return Ok(new { Message = $"Policy {id} has been soft-deleted (deactivated)." });
    }
}
