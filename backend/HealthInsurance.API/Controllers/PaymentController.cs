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
    private readonly IGenericRepository<User> _userRepo;
    private readonly IPremiumService _premiumService;
    private readonly IPolicyService _policyService;
    private readonly IInvoiceService _invoiceService;
    private readonly IDocumentRepository _docRepo;

    public PaymentController(
        IGenericRepository<Payment> paymentRepo,
        IGenericRepository<PremiumQuote> quoteRepo,
        IGenericRepository<User> userRepo,
        IPremiumService premiumService,
        IPolicyService policyService,
        IInvoiceService invoiceService,
        IDocumentRepository docRepo)
    {
        _paymentRepo = paymentRepo;
        _quoteRepo = quoteRepo;
        _userRepo = userRepo;
        _premiumService = premiumService;
        _policyService = policyService;
        _invoiceService = invoiceService;
        _docRepo = docRepo;
    }

    [HttpPost("process")]
    public async Task<IActionResult> ProcessPayment([FromBody] PaymentRequest request)
    {
        var userId = UserSession.CurrentUserId;

        // Fetch the approved quote
        var quote = await _quoteRepo.GetByIdAsync(request.QuoteId);
        if (quote == null || quote.UserId != userId)
            return NotFound("Quote not found.");

        if (quote.IsConvertedToPolicy != 1)
            return BadRequest("Quote must be approved by an agent before payment can be completed.");

        if (quote.IsPaid)
            return BadRequest("Quote has already been paid.");

        // Record the Payment
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
        await _paymentRepo.SaveChangesAsync(); // We need the Payment Id

        // Generate Invoice
        var user = await _userRepo.GetByIdAsync(userId);
        var pdfBytes = await _invoiceService.GenerateInvoiceAsync(payment, quote, user!);

        // Store Invoice in Database Vault
        var invoiceDoc = new DocumentVault
        {
            FileName = $"Invoice_{payment.TransactionReference}.pdf",
            FileData = pdfBytes,
            ContentType = "application/pdf",
            DocumentType = "Invoice",
            RelatedEntityType = "Policy", // Tie invoice to the policy reference
            RelatedEntityId = quote.Id,
            Status = "Verified", // Invoices don't need manual verification
            UploadedByUserId = userId
        };

        await _docRepo.AddAsync(invoiceDoc);
        await _docRepo.SaveChangesAsync();

        // Mark quote as Paid and Activate Policy
        await _policyService.ActivatePolicyAsync(quote.QuoteReference);

        return Ok(new
        {
            message = "Payment successful! Policy activated.",
            transactionRef = payment.TransactionReference,
            quoteId = quote.Id,
            quoteReference = quote.QuoteReference
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
