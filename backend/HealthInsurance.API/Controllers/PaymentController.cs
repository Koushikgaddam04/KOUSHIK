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
    private readonly IPremiumService _premiumService;

    public PaymentController(
        IGenericRepository<Payment> paymentRepo,
        IGenericRepository<PremiumQuote> quoteRepo,
        IPremiumService premiumService)
    {
        _paymentRepo = paymentRepo;
        _quoteRepo = quoteRepo;
        _premiumService = premiumService;
    }

    [HttpPost("process")]
    public async Task<IActionResult> ProcessPayment([FromBody] PaymentRequest request)
    {
        var userId = UserSession.CurrentUserId;

        // --- CREATE the PremiumQuote record for the very first time ---
        // (Calculate was purely transient — nothing was saved then)
        var quote = await _premiumService.CalculateQuoteAsync(
            userId,
            request.Age,
            request.PlanName,
            request.Tier,
            saveToDb: false   // we'll persist it manually below with IsPaid=true
        );

        // Mark as paid right away before saving (single atomic write)
        quote.IsPaid = true;
        quote.IsConvertedToPolicy = 0; // Pending agent review

        await _quoteRepo.AddAsync(quote);
        await _quoteRepo.SaveChangesAsync(); // generates quote.Id

        // --- Record the Payment, linked to the newly created quote ---
        var payment = new Payment
        {
            UserId = userId,
            QuoteId = quote.Id,
            Amount = quote.CalculatedMonthlyPremium,
            TransactionReference = "TXN-" + Guid.NewGuid().ToString().Substring(0, 8).ToUpper(),
            Status = "Completed",
            PaymentDate = DateTime.UtcNow
        };

        await _paymentRepo.AddAsync(payment);
        await _paymentRepo.SaveChangesAsync();

        return Ok(new
        {
            message = "Payment successful!",
            transactionRef = payment.TransactionReference,
            quoteId = quote.Id,              // frontend needs this to upload docs and finalize
            quoteReference = quote.QuoteReference
        });
    }
}

public class PaymentRequest
{
    public int Age { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public string Tier { get; set; } = string.Empty;
    public string CardNumber { get; set; } = string.Empty;
    public string ExpiryDate { get; set; } = string.Empty;
    public string Cvv { get; set; } = string.Empty;
}
