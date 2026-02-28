using HealthInsurance.Domain.Entities;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthInsurance.Application.Interfaces
{
    public interface IDocumentRepository : IGenericRepository<DocumentVault>
    {
        // This allows staff to find all documents for a specific policy or claim
        Task<IEnumerable<DocumentVault>> GetByEntityAsync(string type, int id);
        Task UpdateStatusAsync(int documentId, string status, string reason);
    }
}
