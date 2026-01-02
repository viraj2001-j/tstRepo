"use server"

import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export async function createFullInvoice(allData: any) {
  const session = await getServerSession(authOptions)
  
  const currentUserId = parseInt(session?.user?.id || "0")
  if (!currentUserId || isNaN(currentUserId)) {
     return { success: false, id: null, error: "Authentication Error: Please log in again." }
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // A. Create Client
      const client = await tx.client.create({
        data: {
          name: allData.client.name,
          email: allData.client.email,
          phone: allData.client.phone,
          website: allData.client.website || null,
          address: allData.client.address,
        },
      })

      // B. Conditional Company
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

      // C. Create Invoice
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

    // ✅ Updated Path
    revalidatePath("/dashboard/invoices")
    return { success: true, id: result.id, error: null }

  } catch (error: any) {
    console.error("DATABASE ERROR:", error)
    if (error.code === 'P2002') return { success: false, id: null, error: "Invoice Number already exists!" }
    return { success: false, id: null, error: "Failed to save invoice." }
  }
}


export async function saveNewCategory(name: string) {
  return await prisma.category.create({
    data: { name }
  });
}

export async function getCategories() {
  const cats = await prisma.category.findMany({
    orderBy: { name: 'asc' }
  });
  return cats.map(c => c.name);
}

// Inside your server-side code
export async function deleteCategory(categoryName: string) {
  return await prisma.category.delete({
    where: {
      name: categoryName,
    },
  });
}

// export async function getInvoices() {
//   try {
//     const invoices = await prisma.invoice.findMany({
//       include: {
//         client: true,
//         company: true,
//         // Using the name from your schema (Line 99)
//         createdBy: { 
//           select: { 
//             username: true,
//             role: true 
//           } 
//         },
//         items: true
//       },
//       orderBy: { 
//         createdAt: 'desc' 
//       }
//     });
//     return invoices;
//   } catch (error) {
//     console.error("Error fetching invoices:", error);
//     return [];
//   }
// }

