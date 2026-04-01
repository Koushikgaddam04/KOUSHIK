using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading.Tasks;
using HealthInsurance.Domain.Entities;

namespace HealthInsurance.Application.Interfaces;

public interface IClaimService
{
    Task<(string Message, int ClaimId)> ProcessClaimAsync(int policyId, decimal requestedAmount, string reason, int callerUserId, string sourceType = "Policy");
    Task<IEnumerable<Claim>> GetClaimsByUserIdAsync(int userId);
}