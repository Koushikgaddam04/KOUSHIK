using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Threading.Tasks;

namespace HealthInsurance.Application.Interfaces;

public interface IClaimService
{
    Task<string> ProcessClaimAsync(int policyId, decimal requestedAmount, string reason);
}