using HealthInsurance.Application.Interfaces;
using HealthInsurance.Domain.Entities;
using Microsoft.AspNetCore.Mvc;

namespace HealthInsurance.API.Controllers;

[Route("api/[controller]")]
[ApiController]
public class DocumentController : ControllerBase
{
    private readonly IDocumentRepository _documentRepository;
    private readonly IGenericRepository<PolicyActionLog> _auditRepo;
    private readonly IWebHostEnvironment _environment;

    public DocumentController(IDocumentRepository documentRepository, IGenericRepository<PolicyActionLog> auditRepo, IWebHostEnvironment environment)
    {
        _documentRepository = documentRepository;
        _auditRepo = auditRepo;
        _environment = environment;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload(IFormFile file, string docType, string entityType, int entityId)
    {
        if (file == null || file.Length == 0) return BadRequest("No file uploaded.");

        // 1. Create a unique file name to prevent overwriting
        var fileName = Guid.NewGuid() + Path.GetExtension(file.FileName);
        var uploadsFolder = Path.Combine(_environment.ContentRootPath, "Uploads");

        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

        var filePath = Path.Combine(uploadsFolder, fileName);

        // 2. Save file to physical storage
        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await file.CopyToAsync(stream);
        }

        // 3. Save metadata to DocumentVault table
        var doc = new DocumentVault
        {
            FileName = file.FileName,
            FilePath = filePath,
            DocumentType = docType,
            RelatedEntityType = entityType,
            RelatedEntityId = entityId,
            Status = "Pending", // For Claims Officer to verify later
            UploadedByUserId = 1 // Placeholder until we use Auth
        };

        await _documentRepository.AddAsync(doc);
        await _documentRepository.SaveChangesAsync();

        return Ok(new { message = "Document uploaded successfully!", docId = doc.Id });
    }

    [HttpGet("pending-verification")]
    // [Authorize(Roles = "ClaimsOfficer,Admin")] // Uncomment after testing
    public async Task<IActionResult> GetPendingDocuments()
    {
        var allDocs = await _documentRepository.GetAllAsync();
        var pending = allDocs.Where(d => d.Status == "Pending");
        return Ok(pending);
    }

    [HttpPatch("review/{id}")]
    public async Task<IActionResult> ReviewDocument(int id, string status, string comments)
    {
        // 1. Update Document Status in Database
        await _documentRepository.UpdateStatusAsync(id, status, comments);

        // 2. Heavyweight Audit: Log who did the review
        var auditLog = new HealthInsurance.Domain.Entities.PolicyActionLog
        {
            EntityName = "Document",
            EntityRecordId = id,
            ActionType = "DocumentReview",
            OldValue = "Pending",
            NewValue = status,
            Reason = comments,
            PerformedByUserId = 3 // Example ID for a 'Claims Officer'
        };

        // 3. Save the Log using the injected Repository
        await _auditRepo.AddAsync(auditLog);
        await _auditRepo.SaveChangesAsync(); // Finalize both changes

        return Ok(new { Message = $"Document {id} has been {status}.", Status = status });
    }
}