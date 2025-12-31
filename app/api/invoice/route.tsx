"use server"

import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export async function createFullInvoice(allData: any) {
  const session = await getServerSession(authOptions)
  
  // 1. 🛡️ Guard: Get and validate User ID
  const currentUserId = parseInt(session?.user?.id || "0")

  if (!currentUserId || isNaN(currentUserId)) {
     return { success: false, id: null, error: "Authentication Error: Please log in again." }
  }

  try {
    // 2. ⛓️ Start Transaction
    const result = await prisma.$transaction(async (tx) => {
      
      // A. Create/Update Client
      const client = await tx.client.create({
        data: {
          name: allData.client.name,
          email: allData.client.email,
          phone: allData.client.phone,
          website: allData.client.website || null,
          address: allData.client.address,
        },
      })

      // B. Create Company linked to that Client
      const company = await tx.company.create({
        data: {
          name: allData.company.name,
          address: allData.company.address,
          phone: allData.company.phone,
          email: allData.company.email,
          project: allData.company.project || null,
          clientId: client.id,
        }
      })

      // ✅ C. Update the Client to link back to the Company
  await tx.client.update({
    where: { id: client.id },
    data: {
      companyId: company.id // Now the Client table has the ID!
    }
  })

      // C. Create Invoice with ALL required fields
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber: allData.details.invoiceNumber,
          invoiceDate: new Date(allData.details.invoiceDate),
          dueDate: new Date(allData.details.dueDate),
          currency: allData.details.currency || "LKR",
          category: allData.details.category,

          subtotal: Number(allData.summary.subtotal),
          taxRate: Number(allData.summary.taxRate),
          taxAmount: Number(allData.summary.taxAmount),
          discountType: allData.summary.discountType || "AMOUNT",
          discountValue: Number(allData.summary.discountValue),
          total: Number(allData.summary.total),

          note: allData.notes.note || null,
          terms: allData.notes.terms || null,

          // Foreign Keys
          companyId: company.id,
          clientId: client.id,
          createdById: currentUserId,

          // Nested Items
          items: {
            create: allData.items.map((item: any) => ({
              description: item.description,
              quantity: Number(item.qty),
              rate: Number(item.rate),
              amount: Number(item.qty * item.rate),
            }))
          }
        }
      })

      return invoice
    })

    revalidatePath("/superadmin/invoices")
    return { success: true, id: result.id, error: null }

  } catch (error: any) {
    console.error("DATABASE ERROR:", error)
    
    // Handle unique constraint error for Invoice Number
    if (error.code === 'P2002') {
        return { success: false, id: null, error: "Invoice Number already exists!" }
    }

    return { success: false, id: null, error: "Failed to save invoice. Ensure all fields are valid." }
  }
}