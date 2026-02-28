using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using System;

namespace HealthInsurance.Domain.Entities;

public class PremiumQuote : BaseEntity
{
    // Link to the user (null if they are just a guest browsing)
    public int? UserId { get; set; }
    public User? User { get; set; }

    // Input data used for calculation
    public string SelectedPlanName { get; set; } = string.Empty;
    public string SelectedTierName { get; set; } = string.Empty;
    public int ProspectAge { get; set; }

    // Calculated amounts
    public decimal CalculatedMonthlyPremium { get; set; }
    public decimal CoverageAmount { get; set; }

    // Tracking
    public DateTime ExpiryDate { get; set; }
    public bool IsConvertedToPolicy { get; set; } = false;

    public string QuoteReference { get; set; } = string.Empty;
}