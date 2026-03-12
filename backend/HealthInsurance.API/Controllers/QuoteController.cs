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
    private readonly IGenericRepository<HealthInsurance.Domain.Entities.PremiumQuote> _quoteRepo;

    public QuoteController(
        IPremiumService premiumService,
        IGenericRepository<HealthInsurance.Domain.Entities.PremiumQuote> quoteRepo)
    {
        _premiumService = premiumService;
        _quoteRepo = quoteRepo;
    }

    /// <summary>
    /// Calculates a premium quote on the fly — does NOT persist anything to the database.
    /// The result is transient; only payment will create the real DB record.
    /// </summary>
    [HttpPost("calculate")]
    public async Task<IActionResult> Calculate([FromBody] QuoteRequestDto request)
    {
        var userId = UserSession.CurrentUserId;
        // saveToDb = false: pure calculation, no DB write
        var quote = await _premiumService.CalculateQuoteAsync(userId, request.Age, request.PlanName, request.Tier, false);
        return Ok(quote);
    }

    /// <summary>
    /// Called to submit the application and save the quote to the database before verification.
    /// </summary>
    [HttpPost("request")]
    public async Task<IActionResult> RequestPolicy([FromBody] QuoteRequestDto request)
    {
        var userId = UserSession.CurrentUserId;

        // Calculate and save the quote to DB.
        // It will have IsConvertedToPolicy = 0 (Pending Verification) and IsPaid = false.
        var quote = await _premiumService.CalculateQuoteAsync(userId, request.Age, request.PlanName, request.Tier, saveToDb: true);

        return Ok(new { message = "Policy requested.", quoteId = quote.Id });
    }
}
