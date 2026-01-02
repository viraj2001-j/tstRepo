"use server"
import prisma from "@/lib/db"

export async function checkAndSetOverdueInvoices() {
  const today = new Date();
  
  try {
    const result = await prisma.invoice.updateMany({
      where: {
        status: { notIn: ['PAID', 'OVERDUE'] },
        dueDate: { lt: today }
      },
      data: {
        status: 'OVERDUE'
      }
    });

    console.log(`✅ Maintenance: Updated ${result.count} invoices to OVERDUE.`);
    return result.count; 
  } catch (error) {
    console.error("❌ Maintenance Error:", error);
    return 0;
  }
}