"use server"

import prisma from "@/lib/db"
import nodemailer from "nodemailer"
import { revalidatePath } from "next/cache"

export async function sendInvoiceEmail(invoiceId: number) {
  try {
    // 1. Fetch data
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { client: true }
    });

    if (!invoice || !invoice.client.email) {
      return { success: false, error: "Invoice or Client Email not found" };
    }

    // 2. Setup Nodemailer Transporter
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // 3. Define Public Link
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const shareLink = `${baseUrl}/public/invoice/${invoice.id}`;

    // 4. Send Email
    const mailOptions = {
      from: `"Your Billing Name" <${process.env.GMAIL_USER}>`,
      to: invoice.client.email,
      subject: `Invoice #${invoice.invoiceNumber} - Action Required`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; border: 1px solid #e2e8f0; padding: 30px; border-radius: 12px;">
          <h2 style="color: #1e293b; margin-bottom: 20px;">Invoice #${invoice.invoiceNumber}</h2>
          <p>Hello ${invoice.client.name},</p>
          <p>Your invoice for <strong>${invoice.currency} ${invoice.total.toLocaleString()}</strong> is ready.</p>
          <p>Please click the button below to view and digitally sign the document:</p>
          <div style="margin-top: 30px;">
            <a href="${shareLink}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
              View & Sign Invoice
            </a>
          </div>
          <p style="color: #64748b; font-size: 12px; margin-top: 40px;">
            If you have any questions, please reply to this email.
          </p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    // 5. Update Status in DB
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'SENT' }
    });

    revalidatePath("/dashboard/invoices");
    return { success: true };

  } catch (error: any) {
    console.error("NODEMAILER ERROR:", error);
    return { success: false, error: error.message };
  }
}
