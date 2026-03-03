using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthInsurance.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RemoveTierNameFromPolicy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TierName",
                table: "Policies");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "TierName",
                table: "Policies",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
