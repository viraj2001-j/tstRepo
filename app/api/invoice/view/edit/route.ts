"use server"
import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function updateFullInvoiceAction(invoiceId: number, data: any) {
  try {
    await prisma.$transaction(async (tx) => {
      // 1. Update Client Information
      const updatedClient = await tx.client.update({
        where: { id: data.clientId },
        data: {
          name: data.client.name,
          email: data.client.email,
          phone: data.client.phone,
          address: data.client.address,
        },
      });

      // 2. Update Company Information (if exists)
      if (data.companyId) {
        await tx.company.update({
          where: { id: data.companyId },
          data: {
            name: data.company.name,
            address: data.company.address,
            phone: data.company.phone,
            email: data.company.email,
            project: data.company.project,
          },
        });
      }

      // 3. Update Invoice Details, Summary, Notes & Terms
      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          invoiceNumber: data.invoiceNumber,
          invoiceDate: new Date(data.invoiceDate),
          dueDate: new Date(data.dueDate),
          currency: data.currency,
          category: data.category,
          subtotal: data.subtotal,
          taxRate: data.taxRate,
          taxAmount: data.taxAmount,
          discountType: data.discountType,
          discountValue: data.discountValue,
          total: data.total,
          note: data.note,
          terms: data.terms,
          // Update Items: Delete old ones and create new ones (simplest way for arrays)
          items: {
            deleteMany: {}, 
            create: data.items.map((item: any) => ({
              description: item.description,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.amount,
            })),
          },
        },
      });
    });

    revalidatePath("/dashboard/invoices");
    return { success: true };
  } catch (error) {
    console.error("Update Error:", error);
    return { success: false, error: "Failed to update full invoice data." };
  }
}