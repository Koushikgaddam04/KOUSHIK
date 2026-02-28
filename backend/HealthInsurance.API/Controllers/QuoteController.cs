using HealthInsurance.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace HealthInsurance.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class QuoteController : ControllerBase
{
    private readonly IPremiumService _premiumService;

    public QuoteController(IPremiumService premiumService)
    {
        _premiumService = premiumService;
    }

    [HttpPost("calculate")]
    public async Task<IActionResult> Calculate(int age, string plan, string tier)
    {
        // For now, we use a dummy UserId until we link the logged-in user
        var quote = await _premiumService.CalculateQuoteAsync(1, age, plan, tier);
        return Ok(quote);
    }
}