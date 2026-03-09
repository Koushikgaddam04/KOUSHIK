using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HealthInsurance.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class FixClaimsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<int>(
                name: "PolicyId",
                table: "Claims",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<int>(
                name: "PremiumQuoteId",
                table: "Claims",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Claims_PremiumQuoteId",
                table: "Claims",
                column: "PremiumQuoteId");

            migrationBuilder.AddForeignKey(
                name: "FK_Claims_PremiumQuotes_PremiumQuoteId",
                table: "Claims",
                column: "PremiumQuoteId",
                principalTable: "PremiumQuotes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Claims_PremiumQuotes_PremiumQuoteId",
                table: "Claims");

            migrationBuilder.DropIndex(
                name: "IX_Claims_PremiumQuoteId",
                table: "Claims");

            migrationBuilder.DropColumn(
                name: "PremiumQuoteId",
                table: "Claims");

            migrationBuilder.AlterColumn<int>(
                name: "PolicyId",
                table: "Claims",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);
        }
    }
}
