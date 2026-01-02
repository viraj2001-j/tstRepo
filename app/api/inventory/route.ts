import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  // 🛡️ Server-side security check
  if (
    !session ||
    (session.user.role !== "ADMIN" &&
      session.user.role !== "SUPERADMIN")
  ) {
    return NextResponse.redirect(new URL("/login", request.url));
    // OR, if this is a pure API:
    // return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  try {
    const data = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { message: "Error fetching data" },
      { status: 500 }
    );
  }
}
