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
    /// Called after payment + document upload to confirm the policy request.
    /// Looks up the existing paid quote (created during payment) — does NOT insert a new record.
    /// </summary>
    [HttpPost("request")]
    public async Task<IActionResult> RequestPolicy([FromBody] FinalizeQuoteDto request)
    {
        var userId = UserSession.CurrentUserId;

        // Find the existing paid quote — it was already created during payment
        var quote = await _quoteRepo.GetByIdAsync(request.QuoteId);
        if (quote == null || quote.UserId != userId)
            return NotFound("Quote not found.");

        if (!quote.IsPaid)
            return BadRequest("Payment has not been completed for this quote.");

        // No new record — the quote already exists. Just return it so the frontend can proceed.
        return Ok(quote);
    }
}

/// <summary>
/// DTO used by the final policy request step. Only needs the QuoteId since
/// the record already exists in the DB (created during payment).
/// </summary>
public class FinalizeQuoteDto
{
    public int QuoteId { get; set; }
}
