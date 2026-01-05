"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function syncExistingInvoices() {
  try {
    // 1. Fetch the official signature from the Super Admin's record
    const admin = await prisma.user.findFirst({
      where: { role: 'SUPERADMIN' },
      select: { signature: true }
    });

    if (!admin?.signature) {
      return { success: false, error: "No admin signature found in profile." };
    }

    // 2. Update all invoices where the admin signature is currently null
    const result = await prisma.invoice.updateMany({
      where: { 
        adminSignature: null 
      },
      data: { 
        adminSignature: admin.signature 
      }
    });

    revalidatePath("/dashboard/invoices");
    return { success: true, count: result.count };
  } catch (error) {
    console.error("Sync Error:", error);
    return { success: false, error: "Database update failed." };
  }
}