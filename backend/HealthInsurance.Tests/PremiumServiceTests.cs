using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using HealthInsurance.Application.Interfaces;
using HealthInsurance.Application.Services;
using HealthInsurance.Domain.Entities;
using Moq;
using Xunit;

namespace HealthInsurance.Tests
{
    public class PremiumServiceTests
    {
        private readonly Mock<IQuoteRepository> _quoteRepoMock;
        private readonly Mock<IGenericRepository<Policy>> _policyRepoMockLocal;
        private readonly PremiumService _premiumService;

        public PremiumServiceTests()
        {
            _quoteRepoMock = new Mock<IQuoteRepository>();
            _policyRepoMockLocal = new Mock<IGenericRepository<Policy>>();
            _premiumService = new PremiumService(_quoteRepoMock.Object, _policyRepoMockLocal.Object);
        }

        [Fact]
        public async Task CalculateQuoteAsync_ShouldReturnSilverTierResult_ByDefaultForUnknownTier()
        {
            // Arrange
            int userId = 1;
            int age = 25;
            string planName = "Basic";
            string tierName = "Unknown";

            // Act
            var result = await _premiumService.CalculateQuoteAsync(userId, age, planName, tierName, saveToDb: false);

            // Assert
            // Base 500 + AgeLoad ((25/10)*0.1*500 = 2*0.1*500 = 100) = 600
            // Silver multiplier is 1.0 -> 600 * 1.0 = 600
            Assert.Equal(600m, result.CalculatedMonthlyPremium);
            Assert.Equal("Unknown", result.SelectedTierName);
        }

        [Theory]
        [InlineData("Gold", 1.2, 720)] // (500 + 100) * 1.2 = 720
        [InlineData("Platinum", 1.5, 900)] // (500 + 100) * 1.5 = 900
        [InlineData("Silver", 1.0, 600)] // (500 + 100) * 1.0 = 600
        public async Task CalculateQuoteAsync_ShouldApplyCorrectTierMultiplier(string tier, double expectedMultiplier, decimal expectedPremium)
        {
            // Arrange
            int userId = 1;
            int age = 20; // AgeLoad: (20/10)*0.1*500 = 100
            string planName = "Comprehensive";

            // Act
            var result = await _premiumService.CalculateQuoteAsync(userId, age, planName, tier, saveToDb: false);

            // Assert
            Assert.Equal(expectedPremium, result.CalculatedMonthlyPremium);
        }

        [Fact]
        public async Task CalculateQuoteAsync_ShouldApplyAgeAdjustmentCorrectly()
        {
            // Arrange
            int userId = 1;
            int age = 45; // AgeLoad: (45/10)*0.1*500 = 4*0.1*500 = 200
            string planName = "Basic";
            string tierName = "Silver"; // Multiplier 1.0

            // Act
            var result = await _premiumService.CalculateQuoteAsync(userId, age, planName, tierName, saveToDb: false);

            // Assert
            // 500 + 200 = 700
            Assert.Equal(700m, result.CalculatedMonthlyPremium);
        }

        [Fact]
        public async Task CalculateQuoteAsync_ShouldCallSave_WhenSaveToDbIsTrue()
        {
            // Arrange
            int userId = 1;
            int age = 30;
            string planName = "Basic";
            string tierName = "Silver";

            // Act
            await _premiumService.CalculateQuoteAsync(userId, age, planName, tierName, saveToDb: true);

            // Assert
            _quoteRepoMock.Verify(r => r.AddAsync(It.IsAny<PremiumQuote>()), Times.Once);
            _quoteRepoMock.Verify(r => r.SaveChangesAsync(), Times.Once);
        }
    }

    public class DashboardServiceTests
    {
        private readonly Mock<IGenericRepository<Policy>> _policyRepoMock;
        private readonly Mock<IGenericRepository<Claim>> _claimRepoMock;
        private readonly Mock<IGenericRepository<AgentCommissionLog>> _commissionRepoMock;
        private readonly Mock<IGenericRepository<DocumentVault>> _docRepoMock;
        private readonly Mock<IQuoteRepository> _quoteRepoMock;
        private readonly Mock<IGenericRepository<User>> _userRepoMock;
        private readonly Mock<IGenericRepository<PolicyActionLog>> _auditRepoMock;
        private readonly DashboardService _dashboardService;

        public DashboardServiceTests()
        {
            _policyRepoMock = new Mock<IGenericRepository<Policy>>();
            _claimRepoMock = new Mock<IGenericRepository<Claim>>();
            _commissionRepoMock = new Mock<IGenericRepository<AgentCommissionLog>>();
            _docRepoMock = new Mock<IGenericRepository<DocumentVault>>();
            _quoteRepoMock = new Mock<IQuoteRepository>();
            _userRepoMock = new Mock<IGenericRepository<User>>();
            _auditRepoMock = new Mock<IGenericRepository<PolicyActionLog>>();

            // Add an empty setup for the mock to prevent null reference issues
            _auditRepoMock.Setup(m => m.GetAllAsync()).ReturnsAsync(new List<PolicyActionLog>());

            _dashboardService = new DashboardService(
                _policyRepoMock.Object,
                _claimRepoMock.Object,
                _commissionRepoMock.Object,
                _docRepoMock.Object,
                _quoteRepoMock.Object,
                _userRepoMock.Object,
                _auditRepoMock.Object);
        }

        [Fact]
        public async Task GetAdminStatsAsync_ShouldReturnCorrectMetrics()
        {
            // Arrange
            var policies = new List<Policy>
            {
                new Policy { Status = "Active", MonthlyPremium = 100, IsActive = true, UserId = 2 },
                new Policy { Status = "Active", MonthlyPremium = 200, IsActive = true, UserId = 3 },
                new Policy { Status = "Pending", MonthlyPremium = 50, IsActive = true, UserId = 4 }
            };
            
            _policyRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(policies);
            _claimRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<Claim>());
            _commissionRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<AgentCommissionLog>());
            _docRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<DocumentVault>());
            _quoteRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<PremiumQuote>());
            _userRepoMock.Setup(r => r.GetAllAsync()).ReturnsAsync(new List<User>());

            // Act
            var result = await _dashboardService.GetAdminStatsAsync();

            // Assert
            Assert.Equal(2, result["totalActivePolicies"]);
            // Revenue sums only Active policies (not Pending): 100 + 200 = 300
            Assert.Equal(300m, result["totalRevenue"]);
            Assert.Equal(0, result["totalCustomers"]);
        }
    }
}
