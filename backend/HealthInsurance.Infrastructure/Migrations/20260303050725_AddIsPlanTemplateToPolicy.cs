using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthInsurance.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddIsPlanTemplateToPolicy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsPlanTemplate",
                table: "Policies",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsPlanTemplate",
                table: "Policies");
        }
    }
}
