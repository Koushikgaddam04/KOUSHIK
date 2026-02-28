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
    public string TierName { get; set; } = string.Empty;

    public decimal MonthlyPremium { get; set; }
    public decimal CoverageAmount { get; set; }
    public DateTime ExpiryDate { get; set; }
    public string Status { get; set; } = "Active";
}
