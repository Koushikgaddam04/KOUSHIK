using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthInsurance.Domain.Entities;

public class DocumentVault : BaseEntity
{
    public string FileName { get; set; } = string.Empty;
    public byte[]? FileData { get; set; } // Store files in SQL directly
    public string ContentType { get; set; } = "application/octet-stream";
    public string DocumentType { get; set; } = string.Empty; // e.g., "Aadhar", "HospitalBill", "Invoice"

    // Status for the Claims Officer to update
    public string Status { get; set; } = "Pending"; // Pending, Verified, Rejected

    // Relationships
    public int UploadedByUserId { get; set; }
    public User? UploadedByUser { get; set; }

    // Generic linking (can belong to a Policy or a Claim)
    public string RelatedEntityType { get; set; } = string.Empty; // "Policy" or "Claim"
    public int RelatedEntityId { get; set; }

    // AI Analysis result summary
    public string? AiAnalysis { get; set; }
}