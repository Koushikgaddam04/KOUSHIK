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
        var uploadsFolder = Path.Combine(_environment.ContentRootPath, "Uploads");

        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

        var filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await request.File.CopyToAsync(stream);
        }

        var doc = new DocumentVault
        {
            FileName = request.File.FileName,
            FilePath = fileName, // Store relative filename for easier download
            DocumentType = request.DocType,
            RelatedEntityType = "User",
            RelatedEntityId = userId,
            Status = "Pending",
            UploadedByUserId = userId
        };

        await _docRepo.AddAsync(doc);
        await _docRepo.SaveChangesAsync();

        return Ok(new { message = "Document uploaded successfully!", docId = doc.Id });
    }

    [HttpGet("my-documents")]
    public async Task<IActionResult> GetMyDocuments()
    {
        var userId = UserSession.CurrentUserId;
        var allDocs = await _docRepo.GetAllAsync();
        var myDocs = allDocs.Where(d => d.UploadedByUserId == userId).ToList();
        return Ok(myDocs);
    }

    [HttpGet("user/{userId}")]
    public async Task<IActionResult> GetUserDocuments([FromRoute] int userId)
    {
        var allDocs = await _docRepo.GetAllAsync();
        var userDocs = allDocs.Where(d => d.UploadedByUserId == userId).ToList();
        return Ok(userDocs);
    }

    [HttpGet("download/{fileName}")]
    public IActionResult DownloadDocument([FromRoute] string fileName)
    {
        var filePath = Path.Combine(_environment.ContentRootPath, "Uploads", fileName);
        if (!System.IO.File.Exists(filePath)) return NotFound();

        var fileBytes = System.IO.File.ReadAllBytes(filePath);
        return File(fileBytes, "application/octet-stream", fileName);
    }

    [HttpPatch("review/{id}")]
    [Authorize(Roles = "ClaimOfficer,Admin")]
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
    public IFormFile File { get; set; }
    public string DocType { get; set; }
}

public class DocumentReviewRequest
{
    public string Status { get; set; } = string.Empty;
    public string Comments { get; set; } = string.Empty;
}
