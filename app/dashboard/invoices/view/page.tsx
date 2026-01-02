import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getInvoices } from "@/app/api/invoice/view/route";
import InvoiceDashboardUI from "./InvoiceDashboardUI";

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  // Only ADMIN and SUPERADMIN allowed
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const invoices = await getInvoices();
const now = new Date();
// Get the exact start of "today" for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

// 🧮 Enhanced Summary Calculations
  const summaryStats = {
    totalInvoices: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
    paidCount: invoices.filter(inv => inv.status === "PAID").length,
    
    // Pending: Drafts or Sent invoices that are NOT yet overdue
    pendingCount: invoices.filter(inv => 
      (inv.status === "DRAFT" || inv.status === "SENT") && 
      new Date(inv.dueDate) >= today
    ).length,

    // Overdue: Any invoice NOT paid where the due date has passed
    overdueCount: invoices.filter(inv => 
      inv.status !== "PAID" && 
      new Date(inv.dueDate) < today
    ).length,
  };

  return (
    <div className="p-8 bg-slate-50 min-h-screen">
      <InvoiceDashboardUI 
        initialInvoices={invoices} 
        userRole={session.user.role} 
        stats={summaryStats}
      />
      {/* <h1>user: {session.user.role} </h1> */}
    </div>
  );
}