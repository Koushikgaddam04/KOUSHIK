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

    public ClaimController(IClaimService claimService, IQuoteRepository quoteRepo, IGenericRepository<Policy> policyRepo)
    {
        _claimService = claimService;
        _quoteRepo = quoteRepo;
        _policyRepo = policyRepo;
    }

    [HttpPost("submit")]
    public async Task<IActionResult> SubmitClaim([FromBody] ClaimRequestDto request)
    {
        if (request.Amount <= 0) return BadRequest("Claim amount must be greater than zero.");

        var (message, claimId) = await _claimService.ProcessClaimAsync(request.PolicyId, request.Amount, request.Reason, UserSession.CurrentUserId);

        if (message.StartsWith("Rejected") || message.StartsWith("Error"))
        {
            return BadRequest(new { Message = message });
        }

        return Ok(new { Message = message, ClaimId = claimId });
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
