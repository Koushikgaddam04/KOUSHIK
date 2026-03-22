using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthInsurance.Domain.Entities;

public class Dependent : BaseEntity
{
    public int UserId { get; set; }
    public User? User { get; set; }

    public string Name { get; set; } = string.Empty;
    public int Age { get; set; }
    public string Relationship { get; set; } = string.Empty; // Spouse, Child, Parent, etc.
}
