using HealthInsurance.Application.Interfaces;
using HealthInsurance.Domain.Entities;
using HealthInsurance.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace HealthInsurance.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class DependentController : BaseApiController
{
    private readonly IGenericRepository<Dependent> _dependentRepo;

    public DependentController(IGenericRepository<Dependent> dependentRepo)
    {
        _dependentRepo = dependentRepo;
    }

    [HttpGet("my-dependents")]
    public async Task<IActionResult> GetMyDependents()
    {
        var userId = UserSession.CurrentUserId;
        var all = await _dependentRepo.GetAllAsync();
        var mine = all.Where(d => d.UserId == userId).ToList();
        return Ok(mine);
    }

    [HttpPost]
    public async Task<IActionResult> AddDependent([FromBody] Dependent dependent)
    {
        dependent.UserId = UserSession.CurrentUserId;
        await _dependentRepo.AddAsync(dependent);
        await _dependentRepo.SaveChangesAsync();
        return Ok(dependent);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteDependent(int id)
    {
        var dep = await _dependentRepo.GetByIdAsync(id);
        if (dep == null || dep.UserId != UserSession.CurrentUserId)
            return NotFound();

        _dependentRepo.Delete(dep);
        await _dependentRepo.SaveChangesAsync();
        return Ok("Deleted.");
    }
}
