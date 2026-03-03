using HealthInsurance.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;
using HealthInsurance.Application.DTOs;
using Microsoft.AspNetCore.Authorization;
using HealthInsurance.Domain;

namespace HealthInsurance.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class QuoteController : BaseApiController
{
    private readonly IPremiumService _premiumService;

    public QuoteController(IPremiumService premiumService)
    {
        _premiumService = premiumService;
    }

    [HttpPost("calculate")]
    public async Task<IActionResult> Calculate([FromBody] QuoteRequestDto request)
    {
        var userId = UserSession.CurrentUserId;
        // We MUST save to DB here so the resulting quote has an ID that the Payment system can reference
        var quote = await _premiumService.CalculateQuoteAsync(userId, request.Age, request.PlanName, request.Tier, true);
        return Ok(quote);
    }
    
    [HttpPost("request")]
    public async Task<IActionResult> RequestPolicy([FromBody] QuoteRequestDto request)
    {
        var userId = UserSession.CurrentUserId;
        // Actually saves the quote to the PremiumQuotes table
        var quote = await _premiumService.CalculateQuoteAsync(userId, request.Age, request.PlanName, request.Tier, true);
        return Ok(quote);
    }
}
