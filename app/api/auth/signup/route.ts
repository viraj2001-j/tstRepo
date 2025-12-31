import  prisma  from "@/lib/db"
import { NextResponse } from "next/server"
import bcrypt from "bcrypt"
import { z } from "zod"

const schema = z.object({
  username: z.string().min(3),
  password: z.string().min(6),
  role: z.enum(["ADMIN", "SUPERADMIN"]),
})

export async function POST(req: Request) {
  const body = await req.json()
  const parsed = schema.safeParse(body)

  if (!parsed.success)
    return NextResponse.json({ error: "Invalid data" }, { status: 400 })

  const { username, password, role } = parsed.data

  const exists = await prisma.user.findUnique({ where: { username } })
  if (exists)
    return NextResponse.json({ error: "User exists" }, { status: 409 })

  const hashed = await bcrypt.hash(password, 10)

  await prisma.user.create({
    data: {
      username,
      password: hashed,
      role,
    },
  })

  return NextResponse.json({ success: true })
}
