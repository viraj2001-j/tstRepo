export const downloadAnalyticsCSV = (data: any) => {
  // 1. Define CSV Headers
  const headers = ["Invoice Number", "Client Name", "Date", "Status", "Total Amount", "Amount Paid", "Balance"];
  
  // 2. Map recent invoices into rows
  const rows = data.recentInvoices.map((inv: any) => [
    inv.invoiceNumber,
    inv.client.name,
    new Date(inv.createdAt).toLocaleDateString(),
    inv.status,
    inv.total,
    inv.amountPaid,
    inv.balanceAmount
  ]);

  // 3. Construct CSV String
  const csvContent = [
    headers.join(","), 
    ...rows.map((row: any) => row.join(","))
  ].join("\n");

  // 4. Create Blob and Trigger Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `Lucifer_Financial_Export_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};