import { checkAndSetOverdueInvoices } from "@/app/api/statusUpdate/route";

export default async function MaintenanceTrigger() {
  // This runs on the server every time the page is rendered
  const updatedCount = await checkAndSetOverdueInvoices();
  
  if (updatedCount > 0) {
    console.log(`[Auto-Update] ${updatedCount} invoices marked as OVERDUE`);
  }

  // This component doesn't need to show anything to the user
  return null; 
}