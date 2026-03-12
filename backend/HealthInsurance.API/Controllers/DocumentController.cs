using HealthInsurance.Application.Interfaces;
using HealthInsurance.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using HealthInsurance.Domain;

namespace HealthInsurance.API.Controllers;

[Route("api/[controller]")]
[ApiController]
[Authorize]
public class DocumentController : BaseApiController
{
    private readonly IDocumentRepository _docRepo;
    private readonly IGenericRepository<PolicyActionLog> _auditRepo;
    private readonly IWebHostEnvironment _environment;

    public DocumentController(IDocumentRepository docRepo, IGenericRepository<PolicyActionLog> auditRepo, IWebHostEnvironment environment)
    {
        _docRepo = docRepo;
        _auditRepo = auditRepo;
        _environment = environment;
    }

    [HttpPost("upload")]
    public async Task<IActionResult> Upload([FromForm] DocumentUploadRequest request)
    {
        if (request.File == null || request.File.Length == 0) return BadRequest("No file uploaded.");

        var userId = UserSession.CurrentUserId;
        var fileName = $"{Guid.NewGuid()}_{request.File.FileName}";
        byte[] fileBytes;
        using (var memoryStream = new MemoryStream())
        {
            await request.File.CopyToAsync(memoryStream);
            fileBytes = memoryStream.ToArray();
        }

        var doc = new DocumentVault
        {
            FileName = request.File.FileName,
            FileData = fileBytes,
            ContentType = request.File.ContentType,
            DocumentType = request.DocType,
            // Link to a specific entity (Policy/Claim/User) based on what the caller provides
            RelatedEntityType = string.IsNullOrEmpty(request.EntityType) ? "User" : request.EntityType,
            RelatedEntityId = request.EntityId > 0 ? request.EntityId : userId,
            Status = "Pending",
            UploadedByUserId = userId
        };

        await _docRepo.AddAsync(doc);
        await _docRepo.SaveChangesAsync();

        // Avoid returning the entire byte array in the response to save bandwidth
        return Ok(new { message = "Document uploaded successfully!", docId = doc.Id });
    }

    [HttpGet("my-documents")]
    public async Task<IActionResult> GetMyDocuments()
    {
        var userId = UserSession.CurrentUserId;
        var allDocs = await _docRepo.GetAllAsync();
        var myDocs = allDocs.Where(d => d.UploadedByUserId == userId)
            .Select(d => new { d.Id, d.FileName, d.DocumentType, d.Status, d.RelatedEntityType, d.RelatedEntityId, d.CreatedAt })
            .ToList();
        return Ok(myDocs);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserDocuments([FromRoute] int userId)
    {
        var allDocs = await _docRepo.GetAllAsync();
        var userDocs = allDocs.Where(d => d.UploadedByUserId == userId)
            .Select(d => new { d.Id, d.FileName, d.DocumentType, d.Status, d.RelatedEntityType, d.RelatedEntityId, d.CreatedAt })
            .ToList();
        return Ok(userDocs);
    }

    // NEW: get documents linked to a specific entity (e.g. Policy/Claim)
    [HttpGet("for/{entityType}/{entityId}")]
    public async Task<IActionResult> GetForEntity([FromRoute] string entityType, [FromRoute] int entityId)
    {
        var allDocs = await _docRepo.GetAllAsync();
        var docs = allDocs
            .Where(d => d.RelatedEntityType.Equals(entityType, StringComparison.OrdinalIgnoreCase)
                     && d.RelatedEntityId == entityId)
            .Select(d => new { d.Id, d.FileName, d.DocumentType, d.Status, d.CreatedAt })
            .ToList();
        return Ok(docs);
    }

    [HttpGet("download/{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> DownloadDocument([FromRoute] int id)
    {
        var doc = await _docRepo.GetByIdAsync(id);
        if (doc == null || doc.FileData == null) return NotFound("Document not found.");

        return File(doc.FileData, "application/octet-stream", doc.FileName);
    }

    [HttpGet("view/{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> ViewDocument([FromRoute] int id)
    {
        var doc = await _docRepo.GetByIdAsync(id);
        if (doc == null || doc.FileData == null) return NotFound("Document not found.");

        return File(doc.FileData, doc.ContentType ?? "application/octet-stream");
    }

    [HttpPatch("review/{id}")]
    [Authorize] // Both Agents and ClaimsOfficers can verify documents
    public async Task<IActionResult> ReviewDocument([FromRoute] int id, [FromBody] DocumentReviewRequest req)
    {
        await _docRepo.UpdateStatusAsync(id, req.Status, req.Comments);

        var auditLog = new PolicyActionLog
        {
            EntityName = "Document",
            EntityRecordId = id,
            ActionType = "DocumentReview",
            OldValue = "Pending",
            NewValue = req.Status,
            Reason = req.Comments,
            PerformedByUserId = UserSession.CurrentUserId
        };

        await _auditRepo.AddAsync(auditLog);
        await _auditRepo.SaveChangesAsync();

        return Ok(new { Message = $"Document {id} has been {req.Status}." });
    }

    [HttpGet("pending")]
    [Authorize(Roles = "ClaimOfficer,Admin")]
    public async Task<IActionResult> GetPendingDocuments()
    {
        var allDocs = await _docRepo.GetAllAsync();
        var pendingDocs = allDocs.Where(d => d.Status == "Pending").ToList();
        return Ok(pendingDocs);
    }
}

public class DocumentUploadRequest
{
    public IFormFile File { get; set; } = null!;
    public string DocType { get; set; } = string.Empty;
    // Optional: link this document to a Policy or Claim entity
    public string? EntityType { get; set; }   // "Policy" or "Claim"
    public int EntityId { get; set; }          // The entity's ID
}

public class DocumentReviewRequest
{
    public string Status { get; set; } = string.Empty;
    public string Comments { get; set; } = string.Empty;
}
