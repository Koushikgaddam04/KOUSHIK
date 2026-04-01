using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HealthInsurance.Application.Interfaces;
using HealthInsurance.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using HealthInsurance.Domain;
using HealthInsurance.Domain.Entities;

namespace HealthInsurance.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ClaimController : BaseApiController
{
    private readonly IClaimService _claimService;
    private readonly IQuoteRepository _quoteRepo;
    private readonly IGenericRepository<Policy> _policyRepo;
    private readonly IVertexAIService _vertexAiService;

    public ClaimController(IClaimService claimService, IQuoteRepository quoteRepo, 
        IGenericRepository<Policy> policyRepo, IVertexAIService vertexAiService)
    {
        _claimService = claimService;
        _quoteRepo = quoteRepo;
        _policyRepo = policyRepo;
        _vertexAiService = vertexAiService;
    }

    [HttpPost("submit")]
    public async Task<IActionResult> SubmitClaim([FromBody] ClaimRequestDto request)
    {
        if (request.Amount <= 0) return BadRequest("Claim amount must be greater than zero.");

        var (message, claimId) = await _claimService.ProcessClaimAsync(request.PolicyId, request.Amount, request.Reason, UserSession.CurrentUserId, request.SourceType);

        if (message.StartsWith("Rejected") || message.StartsWith("Error"))
        {
            return BadRequest(new { Message = message });
        }

        return Ok(new { Message = message, ClaimId = claimId });
    }

    [HttpPost("check-compliance")]
    [AllowAnonymous]
    public async Task<IActionResult> CheckCompliance([FromBody] ClaimRequestDto request)
    {
        if (request.PolicyId <= 0) return BadRequest("Valid Policy ID is required.");

        // 1. Fetch the Policy details (Check legacy Policy table)
        var policy = await _policyRepo.GetByIdAsync(request.PolicyId);
        string policyConditions = "";

        if (policy != null)
        {
            policyConditions = $"Plan: {policy.PlanName}. Pre-existing: {policy.PreExistingConditions}. Waiting Periods logic: Surgery(30d), Maternity(15d).";
        }
        else
        {
            // 2. Fallback: Check PremiumQuote table (Modern Policy flow)
            var quote = await _quoteRepo.GetByIdAsync(request.PolicyId);
            if (quote != null)
            {
                policyConditions = $"Plan: {quote.SelectedPlanName}. Pre-existing: {quote.PreExistingConditions}. Waiting Periods logic: Surgery(30d), Maternity(15d).";
            }
            else
            {
                return BadRequest($"Policy with ID {request.PolicyId} not found in system.");
            }
        }

        // 3. Call Vertex AI SDK
        var analysis = await _vertexAiService.AnalyzeClaimComplianceAsync(request.Reason, policyConditions, request.Amount);

        return Ok(new { Analysis = analysis });
    }

    [HttpGet("my-claims")]
    public async Task<IActionResult> GetMyClaims()
    {
        var userId = UserSession.CurrentUserId;
        var claims = await _claimService.GetClaimsByUserIdAsync(userId);
        var quotes = await _quoteRepo.GetAllAsync();
        var policies = await _policyRepo.GetAllAsync();
        
        var result = claims.Select(c => {
            string planName = "Unknown Plan";
            if (c.PremiumQuoteId.HasValue && c.PremiumQuoteId > 0)
            {
                var quote = quotes.FirstOrDefault(q => q.Id == c.PremiumQuoteId);
                planName = quote?.SelectedPlanName ?? "Unknown Plan";
            }
            else if (c.PolicyId.HasValue && c.PolicyId > 0)
            {
                var policy = policies.FirstOrDefault(p => p.Id == c.PolicyId);
                planName = policy?.PlanName ?? "Unknown Plan";
            }

            return new
            {
                id = c.Id,
                policyId = c.PolicyId,
                premiumQuoteId = c.PremiumQuoteId,
                planName = planName,
                claimAmount = c.ClaimAmount,
                reason = c.Reason,
                status = c.Status,
                createdAt = c.CreatedAt
            };
        });
        return Ok(result);
    }
}
