using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HealthInsurance.Application.Interfaces;
using HealthInsurance.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using HealthInsurance.Domain;

namespace HealthInsurance.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class ClaimController : BaseApiController
{
    private readonly IClaimService _claimService;

    public ClaimController(IClaimService claimService)
    {
        _claimService = claimService;
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
        var result = claims.Select(c => new
        {
            id = c.Id,
            policyId = c.PolicyId,
            premiumQuoteId = c.PremiumQuoteId,
            claimAmount = c.ClaimAmount,
            reason = c.Reason,
            status = c.Status,
            createdAt = c.CreatedAt
        });
        return Ok(result);
    }
}
