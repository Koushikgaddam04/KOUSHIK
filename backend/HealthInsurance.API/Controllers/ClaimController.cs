using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HealthInsurance.Application.Interfaces;
using HealthInsurance.Application.DTOs;
using Microsoft.AspNetCore.Authorization;

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

        var result = await _claimService.ProcessClaimAsync(request.PolicyId, request.Amount, request.Reason);

        if (result.StartsWith("Rejected") || result.StartsWith("Error"))
        {
            return BadRequest(new { Message = result });
        }

        return Ok(new { Message = result });
    }
}
