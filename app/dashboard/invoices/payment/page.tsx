import prisma from "@/lib/db";
import PaymentsPage from "./PaymentsPage";
import Sidebar from "@/components/sidebar";

export default async function Page() {
    <Sidebar/>
  const invoices = await prisma.invoice.findMany({
    // 🟢 Sort Invoices by newest created first
    orderBy: {
      createdAt: 'desc'
    },
    include: {
      client: true,
      // 🟢 Sort the nested payments so the latest payment shows first in the list
      payments: {
        orderBy: {
          paymentDate: 'desc'
        }
      },
      // Fallback signature from the user who created it
      createdBy: {
        select: {
          signature: true
        }
      }
    },
  });

  return <PaymentsPage invoices={invoices} />;
}