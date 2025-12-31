import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
// ⬇️ ADD THIS IMPORT
import prisma from "@/lib/db"; 

export async function GET() {
  const session = await getServerSession(authOptions);

  // 🛡️ Server-Side Security Check
  if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN")) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    // Now 'prisma' is defined and can be used
    const data = await prisma.user.findMany({
        select: {
            id: true,
            username: true,
            role: true,
            createdAt: true
        }
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ message: "Error fetching data" }, { status: 500 });
  }
}