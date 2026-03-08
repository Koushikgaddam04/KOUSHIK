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

    public string PreExistingConditions { get; set; } = string.Empty;
}
