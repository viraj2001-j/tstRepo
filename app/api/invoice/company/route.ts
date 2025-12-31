"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function saveCompanyData(formData: any, clientId: number) {
  try {
    // 🛡️ Logic: Link company to the specific Client
    const company = await prisma.company.upsert({
      where: { clientId: clientId },
      update: {
        name: formData.name,
        project: formData.project,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
      },
      create: {
        name: formData.name,
        project: formData.project,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        clientId: clientId,
      },
    })

    revalidatePath("/") 
    return { success: true }
  } catch (error) {
    console.error("Database Error:", error)
    return { success: false, error: "Failed to save company details" }
  }
}