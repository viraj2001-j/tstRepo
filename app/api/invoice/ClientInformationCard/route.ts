"use server"

import prisma from "@/lib/db"
import { revalidatePath } from "next/cache"

export async function saveClientData(formData: any) {
  try {
    const client = await prisma.client.create({
      data: {
        name: formData.name,
        email: formData.email, // This will work after 'npx prisma generate'
        phone: formData.phone,
        // Use '|| null' for optional fields to keep Prisma happy
        website: formData.website || null, 
        address: formData.address,
      },
    })

    revalidatePath("/") 
    return { success: true, clientId: client.id }
  } catch (error) {
    console.error("Database Error:", error)
    return { success: false, error: "Database Sync Error: Try running 'npx prisma generate'" }
  }
}