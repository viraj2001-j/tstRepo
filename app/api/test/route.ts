import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  // 🛡️ Role-based protection
  if (
    !session ||
    (session.user.role !== "ADMIN" &&
      session.user.role !== "SUPERADMIN")
  ) {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const invoices = await prisma.invoice.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        invoiceNumber: true,
        invoiceDate: true,
        dueDate: true,
        status: true,
        currency: true,
        subtotal: true,
        taxAmount: true,
        discountValue: true,
        total: true,

        client: {
          select: {
            name: true,
            email: true,
          },
        },

        company: {
          select: {
            name: true,
          },
        },

        createdBy: {
          select: {
            username: true,
            role: true,
          },
        },
      },
    });

    return NextResponse.json(invoices);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Error fetching invoices" },
      { status: 500 }
    );
  }
}
