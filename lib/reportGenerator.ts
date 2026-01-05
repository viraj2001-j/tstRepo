import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const generateExecutiveReport = (stats: any, aging: any) => {
  const doc = new jsPDF();
  const date = new Date().toLocaleDateString();

  // 🟢 Header Section
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(22).setFont("helvetica", "bold").text("LUCIFER. EXECUTIVE REPORT", 14, 20);
  doc.setFontSize(10).setFont("helvetica", "normal").text(`Generated on: ${date}`, 14, 28);

  // 🟢 KPI Summary Table
  autoTable(doc, {
    startY: 35,
    head: [['Metric', 'Value']],
    body: [
      ['Total Revenue', `LKR ${stats.totalRevenue.toLocaleString()}`],
      ['Total Collected', `LKR ${stats.totalPaid.toLocaleString()}`],
      ['Total Outstanding', `LKR ${stats.totalOwed.toLocaleString()}`],
      ['Collection Rate', `${stats.collectionRate.toFixed(1)}%`],
      ['Average Invoice Value', `LKR ${stats.avgInvoice.toLocaleString()}`],
    ],
    headStyles: { fillColor: [15, 23, 42] }, // Slate-900
    styles: { fontStyle: 'bold' }
  });

  // 🟢 Aging Report Table
  const finalY = (doc as any).lastAutoTable.finalY + 15;
  doc.setFontSize(14).text("Accounts Receivable Aging", 14, finalY);
  
  autoTable(doc, {
    startY: finalY + 5,
    head: [['Bucket', 'Outstanding Balance']],
    body: [
      ['0-30 Days', `LKR ${aging["0-30"].toLocaleString()}`],
      ['31-60 Days', `LKR ${aging["31-60"].toLocaleString()}`],
      ['61-90 Days', `LKR ${aging["61-90"].toLocaleString()}`],
      ['90+ Days', `LKR ${aging["90+"].toLocaleString()}`],
    ],
    headStyles: { fillColor: [225, 29, 72] }, // Rose-600
  });

  // 🟢 Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFontSize(8).setTextColor(150).text("Confidential - Lucifer Accounts Analytics", 14, pageHeight - 10);

  doc.save(`Lucifer_Executive_Report_${date.replace(/\//g, '-')}.pdf`);
};