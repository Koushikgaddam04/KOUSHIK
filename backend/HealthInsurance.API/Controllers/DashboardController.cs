using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HealthInsurance.Application.Interfaces;
using System.Threading.Tasks;

namespace HealthInsurance.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DashboardController : ControllerBase
{
    private readonly IDashboardService _dashboardService;

    public DashboardController(IDashboardService dashboardService)
    {
        _dashboardService = dashboardService;
    }

    [HttpGet("admin-summary")]
    public async Task<IActionResult> GetSummary()
    {
        var stats = await _dashboardService.GetAdminStatsAsync();
        return Ok(stats);
    }
}