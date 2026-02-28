using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;


namespace HealthInsurance.Application.Interfaces;

public interface IDashboardService
{
    Task<Dictionary<string, object>> GetAdminStatsAsync();
}