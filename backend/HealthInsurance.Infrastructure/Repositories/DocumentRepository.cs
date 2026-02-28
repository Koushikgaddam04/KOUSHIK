using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using HealthInsurance.Application.Interfaces;
using HealthInsurance.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace HealthInsurance.Infrastructure.Repositories;

public class DocumentRepository : GenericRepository<DocumentVault>, IDocumentRepository
{
    public DocumentRepository(HealthInsuranceDbContext context) : base(context) { }

    public async Task<IEnumerable<DocumentVault>> GetByEntityAsync(string type, int id)
    {
        return await _context.Documents
            .Where(d => d.RelatedEntityType == type && d.RelatedEntityId == id)
            .ToListAsync();
    }
    public async Task UpdateStatusAsync(int documentId, string status, string reason)
    {
        var doc = await _context.Documents.FindAsync(documentId);
        if (doc != null)
        {
            doc.Status = status; // "Verified" or "Rejected"
            doc.UpdatedAt = DateTime.UtcNow;
            // We could also store the reason in the Document table if we add a column
            _context.Documents.Update(doc);
        }
    }
}