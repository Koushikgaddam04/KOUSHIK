using System;
using System.IO;
using System.Threading.Tasks;
using HealthInsurance.Application.Interfaces;
using HealthInsurance.Domain.Entities;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace HealthInsurance.Application.Services;

public class InvoiceService : IInvoiceService
{
    public InvoiceService()
    {
        // QuestPDF requires a license configuration. We use the free Community license.
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<byte[]> GenerateInvoiceAsync(Payment payment, PremiumQuote quote, User user)
    {
        var document = Document.Create(container =>
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(2, Unit.Centimetre);
                page.PageColor(Colors.White);
                page.DefaultTextStyle(x => x.FontSize(11).FontFamily(Fonts.Arial));

                page.Header().Element(compose => ComposeHeader(compose, payment, quote));
                page.Content().Element(compose => ComposeContent(compose, payment, quote, user));
                page.Footer().Element(ComposeFooter);
            });
        });

        // Generate PDF in memory
        using var stream = new MemoryStream();
        document.GeneratePdf(stream);
        return stream.ToArray();
    }

    private void ComposeHeader(IContainer container, Payment payment, PremiumQuote quote)
    {
        container.Row(row =>
        {
            row.RelativeItem().Column(column =>
            {
                column.Item().Text("HEALTH INSURANCE INC.").FontSize(20).SemiBold().FontColor(Colors.Blue.Darken2);
                column.Item().Text("123 Wellness Avenue, Secure City, SC 45678");
                column.Item().Text("support@healthinsurance.com | +1 800-555-0199");
            });

            row.ConstantItem(150).Column(column =>
            {
                column.Item().Text("INVOICE").FontSize(24).ExtraBold().FontColor(Colors.Grey.Darken3).AlignRight();
                column.Item().Text($"# {payment.TransactionReference}").Bold().AlignRight();
                column.Item().Text($"Date: {payment.PaymentDate:MMM dd, yyyy}").AlignRight();
            });
        });
    }

    private void ComposeContent(IContainer container, Payment payment, PremiumQuote quote, User user)
    {
        container.PaddingVertical(1, Unit.Centimetre).Column(column =>
        {
            column.Spacing(20);

            // Billed To Section
            column.Item().Row(row =>
            {
                row.RelativeItem().Column(billCol =>
                {
                    billCol.Item().Text("Billed To:").SemiBold().FontColor(Colors.Grey.Darken2);
                    billCol.Item().Text(user?.FullName ?? "Customer").Bold().FontSize(12);
                    billCol.Item().Text(user?.Email ?? "");
                });

                row.RelativeItem().Column(policyCol =>
                {
                    policyCol.Item().Text("Policy details:").SemiBold().FontColor(Colors.Grey.Darken2);
                    policyCol.Item().Text($"Plan: {quote.SelectedPlanName} ({quote.SelectedTierName})");
                    policyCol.Item().Text($"Coverage: ${quote.CoverageAmount:N2}");
                    policyCol.Item().Text($"Reference: {quote.QuoteReference}");
                });
            });

            // Table
            column.Item().Table(table =>
            {
                // Columns
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(3);
                    columns.RelativeColumn();
                    columns.RelativeColumn();
                    columns.RelativeColumn();
                });

                // Header
                table.Header(header =>
                {
                    header.Cell().Element(CellStyle).Text("Description");
                    header.Cell().Element(CellStyle).AlignRight().Text("Period");
                    header.Cell().Element(CellStyle).AlignRight().Text("Rate");
                    header.Cell().Element(CellStyle).AlignRight().Text("Total");

                    static IContainer CellStyle(IContainer container)
                    {
                        return container.DefaultTextStyle(x => x.SemiBold()).PaddingVertical(5).BorderBottom(1).BorderColor(Colors.Black);
                    }
                });

                // Item
                table.Cell().Element(CellStyle).Text($"Health Insurance Premium - {quote.SelectedPlanName} ({quote.SelectedTierName})");
                table.Cell().Element(CellStyle).AlignRight().Text("1 Month");
                table.Cell().Element(CellStyle).AlignRight().Text($"${payment.Amount:N2}");
                table.Cell().Element(CellStyle).AlignRight().Text($"${payment.Amount:N2}").Bold();

                static IContainer CellStyle(IContainer container)
                {
                    return container.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(10);
                }
            });

            // Total
            column.Item().AlignRight().Text($"Total Paid: ${payment.Amount:N2}").FontSize(14).Bold().FontColor(Colors.Green.Medium);
            
            // Payment Status
            column.Item().PaddingTop(25).Text("Thank you for your payment. Your transaction was processed securely.").Italic().FontColor(Colors.Grey.Darken1);
            column.Item().Text($"Payment Method: {payment.PaymentMethod}").FontColor(Colors.Grey.Darken1);
        });
    }

    private void ComposeFooter(IContainer container)
    {
        container.AlignCenter().Text(x =>
        {
            x.Span("Page ");
            x.CurrentPageNumber();
            x.Span(" of ");
            x.TotalPages();
        });
    }
}
