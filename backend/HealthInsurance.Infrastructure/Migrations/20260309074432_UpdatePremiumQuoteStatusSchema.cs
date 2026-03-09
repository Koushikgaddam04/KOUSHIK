using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthInsurance.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdatePremiumQuoteStatusSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "IsConvertedToPolicy",
                table: "PremiumQuotes",
                type: "int",
                nullable: false,
                oldClrType: typeof(bool),
                oldType: "bit");

            migrationBuilder.AddColumn<int>(
                name: "AgentId",
                table: "PremiumQuotes",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "ClaimsOfficerId",
                table: "PremiumQuotes",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AgentId",
                table: "PremiumQuotes");

            migrationBuilder.DropColumn(
                name: "ClaimsOfficerId",
                table: "PremiumQuotes");

            migrationBuilder.AlterColumn<bool>(
                name: "IsConvertedToPolicy",
                table: "PremiumQuotes",
                type: "bit",
                nullable: false,
                oldClrType: typeof(int),
                oldType: "int");
        }
    }
}
