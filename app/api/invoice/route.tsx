"use server"

import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

/**
 * Creates a complete invoice including client, optional company, and line items.
 * Injects the Super Admin signature into the invoice record at creation.
 */
export async function createFullInvoice(allData: any) {
  const session = await getServerSession(authOptions)
  
  const currentUserId = parseInt(session?.user?.id || "0")
  if (!currentUserId || isNaN(currentUserId)) {
     return { success: false, id: null, error: "Authentication Error: Please log in again." }
  }

  try {
    // 1. Fetch Super Admin signature from the User table
    const admin = await prisma.user.findFirst({
      where: { role: 'SUPERADMIN' },
      select: { signature: true } 
    });

    const result = await prisma.$transaction(async (tx) => {
      // A. Create Client record
      const client = await tx.client.create({
        data: {
          name: allData.client.name,
          email: allData.client.email,
          phone: allData.client.phone,
          website: allData.client.website || null,
          address: allData.client.address,
        },
      })

      // B. Create Company record if data is provided
      let companyId: number | undefined = undefined;
      if (allData.company.name && allData.company.name.trim() !== "") {
        const company = await tx.company.create({
          data: {
            name: allData.company.name,
            address: allData.company.address || null,
            phone: allData.company.phone || null,
            email: allData.company.email || null,
            project: allData.company.project || null,
            clientId: client.id,
          }
        })
        companyId = company.id;
        await tx.client.update({
          where: { id: client.id },
          data: { companyId: companyId }
        })
      }

      // C. Create the Invoice record
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
          companyId: companyId, 
          clientId: client.id,
          createdById: currentUserId,
          
          // Inject Admin Signature from the profile
          adminSignature: admin?.signature || null, 

          items: {
            create: allData.items.map((item: any) => ({
              description: item.description,
              quantity: Number(item.qty || item.quantity),
              rate: Number(item.rate),
              amount: Number((item.qty || item.quantity) * item.rate),
            }))
          }
        }
      })
      return invoice
    })

    revalidatePath("/dashboard/invoices")
    return { success: true, id: result.id, error: null }

  } catch (error: any) {
    console.error("DATABASE ERROR:", error)
    if (error.code === 'P2002') return { success: false, id: null, error: "Invoice Number already exists!" }
    return { success: false, id: null, error: "Failed to save invoice." }
  }
}

/**
 * Category Management Functions
 */

export async function getCategories() {
  const cats = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
  return cats.map(c => c.name);
}

export async function saveNewCategory(name: string) {
  const newCat = await prisma.category.create({
    data: { name }
  });
  revalidatePath("/dashboard/invoices/new");
  return newCat;
}

export async function deleteCategory(categoryName: string) {
  const deleted = await prisma.category.delete({
    where: { name: categoryName },
  });
  revalidatePath("/dashboard/invoices/new");
  return deleted;
}