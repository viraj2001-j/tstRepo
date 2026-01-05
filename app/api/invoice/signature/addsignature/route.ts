"use server"

import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { revalidatePath } from "next/cache"

export async function updateAdminSignature(signatureBase64: string) {
  const session = await getServerSession(authOptions)
  const userId = parseInt(session?.user?.id || "0")

  if (!userId || isNaN(userId)) {
    return { success: false, error: "Unauthorized" }
  }

  try {
    await prisma.user.update({
      where: { id: userId },
      data: { signature: signatureBase64 }
    })

    revalidatePath("/dashboard/profile")
    return { success: true }
  } catch (error) {
    console.error("Update Signature Error:", error)
    return { success: false, error: "Failed to update signature" }
  }
}