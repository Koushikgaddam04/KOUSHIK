using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

using HealthInsurance.Application.Interfaces;

namespace HealthInsurance.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class ClaimController : ControllerBase
{
    private readonly IClaimService _claimService;

    public ClaimController(IClaimService claimService)
    {
        _claimService = claimService;
    }

    [HttpPost("submit")]
    public async Task<IActionResult> SubmitClaim(int policyId, decimal amount, string reason)
    {
        if (amount <= 0) return BadRequest("Claim amount must be greater than zero.");

        var result = await _claimService.ProcessClaimAsync(policyId, amount, reason);

        if (result.StartsWith("Rejected") || result.StartsWith("Error"))
        {
            return BadRequest(result);
        }

        return Ok(new { Message = result });
    }
}