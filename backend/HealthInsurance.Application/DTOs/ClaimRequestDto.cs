namespace HealthInsurance.Application.DTOs;

public class ClaimRequestDto
{
    public int PolicyId { get; set; }
    public decimal Amount { get; set; }
    public string Reason { get; set; } = string.Empty;
}
