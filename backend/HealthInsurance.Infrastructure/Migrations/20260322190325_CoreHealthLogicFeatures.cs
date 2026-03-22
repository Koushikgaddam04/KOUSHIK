using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthInsurance.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CoreHealthLogicFeatures : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "FamilySize",
                table: "PremiumQuotes",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsPorting",
                table: "PremiumQuotes",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PreExistingConditions",
                table: "PremiumQuotes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PreviousInsurer",
                table: "PremiumQuotes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PreviousPolicyNumber",
                table: "PremiumQuotes",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "FamilySize",
                table: "Policies",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<bool>(
                name: "IsPorting",
                table: "Policies",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<string>(
                name: "PreExistingConditions",
                table: "Policies",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PreviousInsurer",
                table: "Policies",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PreviousPolicyNumber",
                table: "Policies",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateTable(
                name: "Dependents",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Age = table.Column<int>(type: "int", nullable: false),
                    Relationship = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Dependents", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Dependents_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Dependents_UserId",
                table: "Dependents",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Dependents");

            migrationBuilder.DropColumn(
                name: "FamilySize",
                table: "PremiumQuotes");

            migrationBuilder.DropColumn(
                name: "IsPorting",
                table: "PremiumQuotes");

            migrationBuilder.DropColumn(
                name: "PreExistingConditions",
                table: "PremiumQuotes");

            migrationBuilder.DropColumn(
                name: "PreviousInsurer",
                table: "PremiumQuotes");

            migrationBuilder.DropColumn(
                name: "PreviousPolicyNumber",
                table: "PremiumQuotes");

            migrationBuilder.DropColumn(
                name: "FamilySize",
                table: "Policies");

            migrationBuilder.DropColumn(
                name: "IsPorting",
                table: "Policies");

            migrationBuilder.DropColumn(
                name: "PreExistingConditions",
                table: "Policies");

            migrationBuilder.DropColumn(
                name: "PreviousInsurer",
                table: "Policies");

            migrationBuilder.DropColumn(
                name: "PreviousPolicyNumber",
                table: "Policies");
        }
    }
}
