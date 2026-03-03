using HealthInsurance.Application.Interfaces;
using HealthInsurance.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using HealthInsurance.Domain;

namespace HealthInsurance.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class PaymentController : BaseApiController
{
    private readonly IGenericRepository<Payment> _paymentRepo;
    private readonly IGenericRepository<PremiumQuote> _quoteRepo;

    public PaymentController(
        IGenericRepository<Payment> paymentRepo,
        IGenericRepository<PremiumQuote> quoteRepo)
    {
        _paymentRepo = paymentRepo;
        _quoteRepo = quoteRepo;
    }

    [HttpPost("process")]
    public async Task<IActionResult> ProcessPayment([FromBody] PaymentRequest request)
    {
        var quote = await _quoteRepo.GetByIdAsync(request.QuoteId);
        if (quote == null) return NotFound("Quote not found.");

        // Simulate payment processing logic here...
        
        var userId = UserSession.CurrentUserId;
        
        var payment = new Payment
        {
            UserId = userId,
            QuoteId = request.QuoteId,
            Amount = quote.CalculatedMonthlyPremium, // First month payment
            TransactionReference = "TXN-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper(),
            Status = "Completed",
            PaymentDate = DateTime.UtcNow
        };

        await _paymentRepo.AddAsync(payment);
        
        // Update Quote status
        quote.IsPaid = true;
        _quoteRepo.Update(quote);
        
        await _paymentRepo.SaveChangesAsync();
        await _quoteRepo.SaveChangesAsync();

        return Ok(new { 
            message = "Payment successful!", 
            transactionRef = payment.TransactionReference 
        });
    }
}

public class PaymentRequest
{
    public int QuoteId { get; set; }
    public string CardNumber { get; set; } = string.Empty;
    public string ExpiryDate { get; set; } = string.Empty;
    public string Cvv { get; set; } = string.Empty;
}
