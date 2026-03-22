using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using HealthInsurance.Domain.Entities;

namespace HealthInsurance.Application.Interfaces;

public interface IPremiumService
{
    Task<PremiumQuote> CalculateQuoteAsync(int userId, int age, string planName, string tierName, int familySize = 1, string preExistingConditions = "", bool isPorting = false, string prevPolNum = "", string prevInsurer = "", bool saveToDb = false);
}
