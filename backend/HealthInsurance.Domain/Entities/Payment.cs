using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthInsurance.Domain.Entities;

public class Payment : BaseEntity
{
    public int UserId { get; set; }
    public User? User { get; set; }

    public int QuoteId { get; set; }
    public PremiumQuote? Quote { get; set; }

    public decimal Amount { get; set; }
    public string PaymentMethod { get; set; } = "CreditCard";
    public string TransactionReference { get; set; } = string.Empty;
    public string Status { get; set; } = "Completed"; // Completed, Failed
    public DateTime PaymentDate { get; set; } = DateTime.UtcNow;
}
