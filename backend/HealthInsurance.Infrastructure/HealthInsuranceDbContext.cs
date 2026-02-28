using HealthInsurance.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace HealthInsurance.Infrastructure;

public class HealthInsuranceDbContext : DbContext
{
    public HealthInsuranceDbContext(DbContextOptions<HealthInsuranceDbContext> options)
        : base(options) { }

    // These represent your tables in SQL Server
    public DbSet<User> Users { get; set; }
    public DbSet<Policy> Policies { get; set; }
    public DbSet<Claim> Claims { get; set; }
    public DbSet<PolicyActionLog> ActionLogs { get; set; }
    public DbSet<DocumentVault> Documents { get; set; }
    public DbSet<AgentCommissionLog> CommissionLogs { get; set; }
    public DbSet<PremiumQuote> PremiumQuotes { get; set; }
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Fix for ClaimAmount in Claim table
        modelBuilder.Entity<Claim>()
            .Property(c => c.ClaimAmount)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Claim>()
        .HasOne(c => c.Policy)
        .WithMany()
        .HasForeignKey(c => c.PolicyId)
        .OnDelete(DeleteBehavior.Restrict);

        // Fix for CoverageAmount in Policy table
        modelBuilder.Entity<Policy>()
            .Property(p => p.CoverageAmount)
            .HasColumnType("decimal(18,2)");

        // Fix for MonthlyPremium in Policy table
        modelBuilder.Entity<Policy>()
            .Property(p => p.MonthlyPremium)
            .HasColumnType("decimal(18,2)");

        modelBuilder.Entity<Policy>()
        .HasOne(p => p.User)
        .WithMany()
        .HasForeignKey(p => p.UserId)
        .OnDelete(DeleteBehavior.Restrict);

        modelBuilder.Entity<PremiumQuote>()
            .Property(p => p.CalculatedMonthlyPremium).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<PremiumQuote>()
            .Property(p => p.CoverageAmount).HasColumnType("decimal(18,2)");

        modelBuilder.Entity<AgentCommissionLog>()
            .Property(a => a.PremiumAmount).HasColumnType("decimal(18,2)");
        modelBuilder.Entity<AgentCommissionLog>()
            .Property(a => a.CommissionRate).HasColumnType("decimal(18,4)"); // Higher precision for rates
        modelBuilder.Entity<AgentCommissionLog>()
            .Property(a => a.EarnedAmount).HasColumnType("decimal(18,2)");

        // You can add logic here to prevent deletion of Audit Logs for security
        modelBuilder.Entity<PolicyActionLog>()
            .HasOne(p => p.PerformedByUser)
            .WithMany()
            .HasForeignKey(p => p.PerformedByUserId)
            .OnDelete(DeleteBehavior.Restrict);


        modelBuilder.Entity<AgentCommissionLog>()
        .HasOne(a => a.Agent)
        .WithMany()
        .HasForeignKey(a => a.AgentId)
        .OnDelete(DeleteBehavior.Restrict);
    }
}