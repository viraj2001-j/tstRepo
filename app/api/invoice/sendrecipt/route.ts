import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const email = formData.get("email") as string;
    const clientName = formData.get("clientName") as string;

    if (!file || !email) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
    user: process.env.GMAIL_USER,

    pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Lucifer Accounts" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: `Official Document - ${clientName}`,
      text: `Dear ${clientName},\n\nPlease find your payment document attached.\n\nThank you, \nLucifer Accounts Team`,
      attachments: [{ filename: file.name, content: buffer }],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}