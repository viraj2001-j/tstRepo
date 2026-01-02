"use server"
import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function getInvoices() {
  return await prisma.invoice.findMany({
    include: {
      client: true,
      company: true,
      items: true, // Needed to count how many items exist
      createdBy: { select: { username: true } }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function updateInvoiceStatus(id: number, status: "PAID" | "DRAFT" | "SENT" | "OVERDUE")  {
  await prisma.invoice.update({
    where: { id },
    data: { status }
  });
  revalidatePath("/dashboard/invoices/view");
}

export async function deleteInvoice(id: number) {
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/dashboard/invoices/view");
}