using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthInsurance.Domain.Entities;

public class Claim : BaseEntity
{
    public decimal ClaimAmount { get; set; }
    public string Reason { get; set; } = string.Empty;
    public string Status { get; set; } = "Pending"; // Pending, Approved, Rejected

    // Foreign Keys
    public int UserId { get; set; } // The Customer who raised it
    public int PolicyId { get; set; } // The Policy they are claiming against

    // Navigation Properties (Helps Entity Framework link tables)
    public User? User { get; set; }
    public Policy? Policy { get; set; }
}