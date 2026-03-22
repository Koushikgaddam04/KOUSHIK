using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace HealthInsurance.Domain.Entities;

public class Policy : BaseEntity
{
    public string PolicyNumber { get; set; } = string.Empty;
    public int UserId { get; set; }
    public User? User { get; set; }

    public string PlanName { get; set; } = string.Empty;
    public string PlanDescription { get; set; } = string.Empty;

    public decimal MonthlyPremium { get; set; }
    public decimal CoverageAmount { get; set; }
    public DateTime ExpiryDate { get; set; }
    public string Status { get; set; } = "Active";
    
    // The assigned agent for this policy (nullable, because policies start unassigned)
    public int? AgentId { get; set; }

    // The assigned claims officer for this policy
    public int? ClaimsOfficerId { get; set; }

    // Discriminator to distinguish between a "Product Plan Template" and a "Customer Policy Instance"
    public bool IsPlanTemplate { get; set; } = false;

    public int FamilySize { get; set; } = 1;
    public string PreExistingConditions { get; set; } = string.Empty;

    public bool IsPorting { get; set; } = false;
    public string PreviousPolicyNumber { get; set; } = string.Empty;
    public string PreviousInsurer { get; set; } = string.Empty;
}
