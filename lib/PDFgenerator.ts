import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePDF = (invoice: any) => {
  const doc = new jsPDF();

  // --- 1. WATERMARK LOGIC ---
  const status = invoice.status?.toUpperCase();
  
  if (status === "PAID" || status === "OVERDUE") {
    doc.saveGraphicsState();
    // 0.12 opacity makes it very subtle so it doesn't interfere with data readability
    doc.setGState(new (doc as any).GState({ opacity: 0.12 })); 
    doc.setFontSize(80);
    doc.setFont("helvetica", "bold");

    if (status === "PAID") {
      doc.setTextColor(34, 197, 94); // Emerald Green
      doc.text("PAID", 105, 150, { align: "center", angle: 45 });
    } else if (status === "OVERDUE") {
      doc.setTextColor(220, 38, 38); // Strong Red
      doc.text("OVERDUE", 105, 150, { align: "center", angle: 45 });
    }
    
    doc.restoreGraphicsState();
  }

  // --- 2. LOGO & HEADER ---
  try {
    doc.addImage("/logo.png", "PNG", 14, 10, 40, 15);
  } catch (error) {
    console.error("Logo not found");
  }

  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0); 
  doc.text("INVOICE", 150, 22);
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 150, 30);
  doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 150, 35);
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 150, 40);

  // --- 3. BILLING DETAILS ---
  doc.setFontSize(11);
  doc.setTextColor(0);
  doc.setFont("helvetica", "bold");
  doc.text("BILL TO:", 14, 45);
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(invoice.client?.name || "N/A", 14, 51);
  if (invoice.company?.name) {
    doc.text(invoice.company.name, 14, 56);
  }
  doc.text(invoice.client?.address || "", 14, 61);

  // --- 4. ITEMS TABLE ---
  const tableRows = invoice.items.map((item: any) => {
    const rate = item.rate ?? 0;
    const qty = item.quantity ?? 0;
    const amount = item.amount ?? (rate * qty);

    return [
      item.description || "No description",
      qty.toString(),
      `${invoice.currency} ${rate.toLocaleString()}`,
      `${invoice.currency} ${amount.toLocaleString()}`,
    ];
  });

  autoTable(doc, {
    startY: 70,
    head: [["Description", "Qty", "Rate", "Amount"]],
    body: tableRows,
    theme: "grid",
    headStyles: { fillColor: [37, 99, 235] }, 
    styles: { fontSize: 9 },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    }
  });

  // --- 5. TOTALS SECTION ---
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  
  doc.setFontSize(10);
  doc.text("Subtotal:", 140, finalY);
  doc.text(`${invoice.currency} ${(invoice.subtotal ?? 0).toLocaleString()}`, 196, finalY, { align: "right" });

  doc.text(`Tax (${invoice.taxRate}%):`, 140, finalY + 7);
  doc.text(`${invoice.currency} ${(invoice.taxAmount ?? 0).toLocaleString()}`, 196, finalY + 7, { align: "right" });

  doc.text(`Discount:`, 140, finalY + 14);
  doc.text(`- ${invoice.currency} ${(invoice.discountValue ?? 0).toLocaleString()}`, 196, finalY + 14, { align: "right" });

  doc.setLineWidth(0.5);
  doc.line(140, finalY + 18, 196, finalY + 18);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("Total:", 140, finalY + 25);
  doc.text(`${invoice.currency} ${(invoice.total ?? 0).toLocaleString()}`, 196, finalY + 25, { align: "right" });

  // --- 6. FOOTER ---
  if (invoice.note) {
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.text("Notes:", 14, finalY + 35);
    doc.setFont("helvetica", "normal");
    doc.text(invoice.note, 14, finalY + 40, { maxWidth: 100 });
  }

  doc.save(`${invoice.invoiceNumber}.pdf`);
};