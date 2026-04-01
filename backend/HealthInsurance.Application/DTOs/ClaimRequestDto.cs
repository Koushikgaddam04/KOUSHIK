using System.ComponentModel.DataAnnotations;

namespace HealthInsurance.Application.DTOs;

public class ClaimRequestDto
{
    [Required]
    public int PolicyId { get; set; }

    [Range(1, 10000000, ErrorMessage = "Claim amount must be greater than 0.")]
    public decimal Amount { get; set; }

    [Required]
    public string Reason { get; set; } = string.Empty;

    public string SourceType { get; set; } = "Policy"; // "Policy" or "Quote"
}
