import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { getInvoices } from "@/app/api/invoice/view/route";
import InvoiceDashboardUI from "./InvoiceDashboardUI";
import Sidebar from "@/components/sidebar"; // Ensure path is correct

export default async function Page() {
  const session = await getServerSession(authOptions);
  
  if (!session || !["ADMIN", "SUPERADMIN"].includes(session.user.role)) {
    redirect("/login");
  }

  const invoices = await getInvoices();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const summaryStats = {
    totalInvoices: invoices.length,
    totalAmount: invoices.reduce((sum, inv) => sum + inv.total, 0),
    paidCount: invoices.filter(inv => inv.status === "PAID").length,
    pendingCount: invoices.filter(inv => 
      (inv.status === "DRAFT" || inv.status === "SENT") && 
      new Date(inv.dueDate) >= today
    ).length,
    overdueCount: invoices.filter(inv => 
      inv.status !== "PAID" && 
      new Date(inv.dueDate) < today
    ).length,
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* 🟢 Sidebar handles its own sticky/fixed state */}
      <Sidebar />

      {/* 🟢 Main Content Area - flex-1 makes it take all remaining space */}
      <main className="flex-1 overflow-x-hidden">
        <div className="p-4 md:p-8 lg:p-10 w-full">
          <InvoiceDashboardUI 
            initialInvoices={invoices} 
            userRole={session.user.role} 
            stats={summaryStats}
          />
        </div>
      </main>
    </div>
  );
}