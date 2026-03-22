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

    // Status: 0=Wait/Pending, 1=Approved, 2=Rejected
    public int IsConvertedToPolicy { get; set; } = 0; 
    public bool IsPaid { get; set; } = false;
    public bool IsActive { get; set; } = false;

    // Staff assignment
    public int? AgentId { get; set; }
    public int? ClaimsOfficerId { get; set; }

    public string QuoteReference { get; set; } = string.Empty;
    public int FamilySize { get; set; } = 1;
    public string PreExistingConditions { get; set; } = string.Empty;

    // Portability fields
    public bool IsPorting { get; set; } = false;
    public string PreviousPolicyNumber { get; set; } = string.Empty;
    public string PreviousInsurer { get; set; } = string.Empty;
}