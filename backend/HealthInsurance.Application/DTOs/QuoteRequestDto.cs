namespace HealthInsurance.Application.DTOs;

public class QuoteRequestDto
{
    public int Age { get; set; }
    public string PlanName { get; set; } = string.Empty;
    public string Tier { get; set; } = string.Empty;
    public string PreExistingConditions { get; set; } = string.Empty;
}
