using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthInsurance.Domain.Entities;

public class PolicyActionLog : BaseEntity
{
    public string EntityName { get; set; } = string.Empty; // "Claim" or "Policy"
    public int EntityRecordId { get; set; } // The ID of the Claim/Policy

    public string ActionType { get; set; } = string.Empty; // "StatusUpdate"
    public string? OldValue { get; set; }
    public string? NewValue { get; set; }

    public string? Reason { get; set; } // Why was the claim rejected?

    // The Staff member (Admin/Agent/Officer) who performed the action
    public int PerformedByUserId { get; set; }
    public User? PerformedByUser { get; set; }
}
