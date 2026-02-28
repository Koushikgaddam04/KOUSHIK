using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HealthInsurance.Domain.Entities;

namespace HealthInsurance.Application.Interfaces;

public interface IPolicyService
{
    Task<bool> ActivatePolicyAsync(string quoteReference, int customerId);
}