import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { toast } from "sonner";

const addAdminSignature = (doc: jsPDF, y: number, signatureData?: string | null) => {
  doc.setTextColor(0, 0, 0); // Force Pure Black
  doc.setDrawColor(0, 0, 0); 
  doc.setFontSize(10).setFont("helvetica", "bold");
  doc.text("Authorized Admin Signature:", 14, y + 10);

  if (signatureData && signatureData.includes("base64")) {
    try {
      doc.addImage(signatureData, 'PNG', 14, y + 12, 45, 18);
    } catch (e) {
      doc.setFont("helvetica", "italic").text("[Digitally Signed]", 14, y + 20);
    }
  }
  doc.setLineWidth(0.5).line(14, y + 32, 70, y + 32);
};

const triggerEmail = async (doc: jsPDF, email: string, name: string, fileName: string) => {
  const formData = new FormData();
  formData.append("file", doc.output('blob'), fileName);
  formData.append("email", email);
  formData.append("clientName", name);

  const res = await fetch("/api/invoice/sendrecipt", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Email failed");
  return res.json();
};

export const shareReceipt = async (payment: any, invoice: any, download: boolean = false) => {
  const doc = new jsPDF();
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(22).setFont("helvetica", "bold").text("LUCIFER. RECEIPT", 14, 20);
  
  autoTable(doc, {
    startY: 30,
    head: [['Invoice', 'Method', 'Paid']],
    body: [[`#${invoice.invoiceNumber}`, payment.method, `${invoice.currency} ${payment.amount.toLocaleString()}`]],
    headStyles: { fillColor: [0, 0, 0] }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  addAdminSignature(doc, finalY, invoice.adminSignature);

  if (download) {
    doc.save(`Receipt_${payment.id}.pdf`);
  } else {
    toast.promise(triggerEmail(doc, invoice.client.email, invoice.client.name, `Receipt_${payment.id}.pdf`), {
      loading: 'Sending Email...',
      success: 'Receipt Shared!',
      error: 'Sharing failed'
    });
  }
};

export const shareStatement = async (invoice: any, download: boolean = false) => {
  const doc = new jsPDF();
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(22).setFont("helvetica", "bold").text("LUCIFER. STATEMENT", 14, 20);
  
  autoTable(doc, {
    startY: 30,
    head: [['Date', 'Method', 'Amount']],
    body: invoice.payments.map((p: any) => [new Date(p.paymentDate).toLocaleDateString(), p.method, p.amount.toLocaleString()]),
    headStyles: { fillColor: [0, 0, 0] }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.text(`Balance Due: ${invoice.currency} ${(invoice.total - invoice.amountPaid).toLocaleString()}`, 14, finalY);
  addAdminSignature(doc, finalY + 10, invoice.adminSignature);

  if (download) {
    doc.save(`Statement_${invoice.invoiceNumber}.pdf`);
  } else {
    toast.promise(triggerEmail(doc, invoice.client.email, invoice.client.name, `Statement_${invoice.invoiceNumber}.pdf`), {
      loading: 'Sending Statement...',
      success: 'Statement Shared!',
      error: 'Sharing failed'
    });
  }
};