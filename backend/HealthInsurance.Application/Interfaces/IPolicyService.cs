using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HealthInsurance.Domain.Entities;

namespace HealthInsurance.Application.Interfaces;

public interface IPolicyService
{
    Task<bool> ApprovePolicyAsync(string quoteReference, int customerId);
    Task<bool> ActivatePolicyAsync(string quoteReference);
    Task<bool> RejectPolicyAsync(string quoteReference);
}