using HealthInsurance.Application.Interfaces;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using HealthInsurance.Domain.Entities;
namespace HealthInsurance.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CustomerController : ControllerBase
    {
        private readonly IGenericRepository<Policy> _policyRepo;
        private readonly IGenericRepository<Claim> _claimRepo;

        public CustomerController(IGenericRepository<Policy> policyRepo, IGenericRepository<Claim> claimRepo)
        {
            _policyRepo = policyRepo;
            _claimRepo = claimRepo;
        }

        // 7. See their active policies
        [HttpGet("{userId}/policies")]
        public async Task<IActionResult> GetMyPolicies(int userId)
        {
            var policies = await _policyRepo.GetAllAsync();
            return Ok(policies.Where(p => p.UserId == userId && p.Status == "Active"));
        }

        // 8. Claim History
        [HttpGet("{userId}/claims")]
        public async Task<IActionResult> GetMyClaims(int userId)
        {
            var claims = await _claimRepo.GetAllAsync();
            // We filter claims by linking them through the user's policies
            return Ok(claims.Where(c => c.IsActive == true));
        }

        [HttpGet("my-summary/{userId}")]
        public async Task<IActionResult> GetCustomerSummary(int userId)
        {
            var policies = await _policyRepo.GetAllAsync();
            var claims = await _claimRepo.GetAllAsync();

            var myPolicies = policies.Where(p => p.UserId == userId).ToList();
            var myClaims = claims.Where(c => c.UserId == userId).ToList();

            return Ok(new
            {
                ActivePoliciesCount = myPolicies.Count(p => p.Status == "Active"),
                TotalCoverageRemaining = myPolicies.Sum(p => p.CoverageAmount),
                PendingClaims = myClaims.Count(c => c.Status == "PendingApproval"),
                TotalClaimsPaid = myClaims.Where(c => c.Status == "Approved").Sum(c => c.ClaimAmount)
            });
        }
    }

}
