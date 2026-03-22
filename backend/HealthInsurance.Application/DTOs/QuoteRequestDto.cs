using System.ComponentModel.DataAnnotations;

namespace HealthInsurance.Application.DTOs;

public class QuoteRequestDto
{
    [Range(18, 110, ErrorMessage = "Age must be between 18 and 110.")]
    public int Age { get; set; }

    [Required]
    public string PlanName { get; set; } = string.Empty;

    [Required]
    public string Tier { get; set; } = string.Empty;

    public int FamilySize { get; set; } = 1;

    public string PreExistingConditions { get; set; } = string.Empty;

    public bool IsPorting { get; set; } = false;
    public string PreviousPolicyNumber { get; set; } = string.Empty;
    public string PreviousInsurer { get; set; } = string.Empty;
}
