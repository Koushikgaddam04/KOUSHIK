using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthInsurance.Domain.Entities;

public class AgentCommissionLog : BaseEntity
{
    public int AgentId { get; set; }
    public User? Agent { get; set; }

    public int PolicyId { get; set; } // The policy that triggered this
    // We don't link the Policy entity yet to avoid migration errors, 
    // but we store the ID for the relationship.

    public decimal PremiumAmount { get; set; }
    public decimal CommissionRate { get; set; } // e.g., 0.10 for 10%
    public decimal EarnedAmount { get; set; } // Premium * Rate

    public string Status { get; set; } = "Pending"; // Pending, Disbursed, Cancelled
    public DateTime? DisbursalDate { get; set; }
}
