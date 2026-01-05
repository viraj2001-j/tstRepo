import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateInvoicePDF = async (invoice: any, includeClientSignature: boolean = false) => {
  const doc = new jsPDF();

  // --- 1. WATERMARK LOGIC ---
  const status = invoice.status?.toUpperCase();
  if (status === "PAID" || status === "OVERDUE") {
    doc.saveGraphicsState();
    doc.setGState(new (doc as any).GState({ opacity: 0.1 })); 
    doc.setFontSize(80);
    doc.setFont("helvetica", "bold");
    if (status === "PAID") {
      doc.setTextColor(34, 197, 94);
      doc.text("PAID", 105, 150, { align: "center", angle: 45 });
    } else if (status === "OVERDUE") {
      doc.setTextColor(220, 38, 38);
      doc.text("OVERDUE", 105, 150, { align: "center", angle: 45 });
    }
    doc.restoreGraphicsState();
  }

  // --- 2. HEADER & LOGO ---
  try {
    // Note: It's better to pass logo as Base64 if it fails to load via URL
    doc.addImage("/logo.png", "PNG", 14, 10, 30, 12);
  } catch (e) { console.error("Logo failed"); }

  doc.setFontSize(20).setFont("helvetica", "bold").text("INVOICE", 150, 20);
  doc.setFontSize(9).setFont("helvetica", "normal").setTextColor(100);
  doc.text(`Invoice #: ${invoice.invoiceNumber}`, 150, 28);
  doc.text(`Date: ${new Date(invoice.invoiceDate).toLocaleDateString()}`, 150, 33);
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`, 150, 38);

  // --- 3. BILLING DETAILS ---
  doc.setFontSize(11).setTextColor(0).setFont("helvetica", "bold").text("BILL TO:", 14, 45);
  doc.setFont("helvetica", "normal").setFontSize(10);
  doc.text(invoice.client?.name || "N/A", 14, 51);
  if (invoice.company?.name) doc.text(invoice.company.name, 14, 56);
  doc.text(invoice.client?.address || "", 14, 61);

  // --- 4. ITEMS TABLE ---
  const tableRows = invoice.items.map((item: any) => [
    item.description || "No description",
    item.quantity?.toString() || "0",
    `${invoice.currency} ${item.rate?.toLocaleString()}`,
    `${invoice.currency} ${item.amount?.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: 70,
    head: [["Description", "Qty", "Rate", "Amount"]],
    body: tableRows,
    theme: "striped",
    headStyles: { fillColor: [37, 99, 235] },
  });

  // --- 5. TOTALS ---
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(10).setFont("helvetica", "normal");
  doc.text("Subtotal:", 140, finalY);
  doc.text(`${invoice.currency} ${invoice.subtotal?.toLocaleString()}`, 196, finalY, { align: "right" });
  
  doc.text(`Tax (${invoice.taxRate}%):`, 140, finalY + 7);
  doc.text(`${invoice.currency} ${invoice.taxAmount?.toLocaleString()}`, 196, finalY + 7, { align: "right" });

  doc.setFontSize(12).setFont("helvetica", "bold");
  doc.text("Total:", 140, finalY + 18);
  doc.text(`${invoice.currency} ${invoice.total?.toLocaleString()}`, 196, finalY + 18, { align: "right" });

  // --- 6. SIGNATURES SECTION ---
  const sigY = finalY + 40;

  // Admin Signature (Always included)
  if (invoice.adminSignature) {
    doc.setFontSize(9).setFont("helvetica", "bold").text("Authorized Signature", 14, sigY);
    try {
      doc.addImage(invoice.adminSignature, "PNG", 14, sigY + 2, 40, 15);
    } catch (e) { doc.text("[Admin Signed]", 14, sigY + 10); }
  }

  // Client Signature (Conditional)
if (includeClientSignature && invoice.isSigned && invoice.signature) {
    doc.setFontSize(9).setFont("helvetica", "bold").text("Client Acceptance", 140, sigY);
    try {
      doc.addImage(invoice.signature, "PNG", 140, sigY + 2, 40, 15);
      
      // Optional: Add the signing date under the signature
      if (invoice.signedAt) {
        doc.setFontSize(7).setFont("helvetica", "normal").setTextColor(100);
        doc.text(`Signed: ${new Date(invoice.signedAt).toLocaleString()}`, 140, sigY + 20);
      }
    } catch (e) { 
      doc.setFont("helvetica", "italic").text("[Client Signed]", 140, sigY + 10); 
    }
  }

  doc.save(`Invoice_${invoice.invoiceNumber}.pdf`);
};