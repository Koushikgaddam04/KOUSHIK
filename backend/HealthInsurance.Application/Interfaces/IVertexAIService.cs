using System.Threading.Tasks;

namespace HealthInsurance.Application.Interfaces;

public interface IVertexAIService
{
    Task<string> AnalyzeClaimComplianceAsync(string claimReason, string policyConditions, decimal amount);
}
