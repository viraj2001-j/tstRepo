"use server"

import prisma from "@/lib/db"
import { Resend } from 'resend'
import { revalidatePath } from "next/cache"

// 1. Safety: Use a fallback to avoid the "undefined" type error
const resend = new Resend(process.env.RESEND_API_KEY || "no-key-found");

export async function sendInvoiceEmail(invoiceId: number) {
  try {
    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { client: true }
    });

    if (!invoice) return { success: false, error: "Invoice not found" };

    // 2. Fallback for the base URL to prevent broken links
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const shareLink = `${baseUrl}/public/invoice/${invoice.id}`;

    await resend.emails.send({
      from: 'Invoicing <onboarding@resend.dev>', 
      to: invoice.client.email,
      subject: `Invoice #${invoice.invoiceNumber} Action Required`,
      html: `
        <div style="font-family: sans-serif; padding: 20px;">
          <h2>Invoice #${invoice.invoiceNumber}</h2>
          <p>Hello ${invoice.client.name},</p>
          <p>Please review and sign your invoice by clicking the link below:</p>
          <a href="${shareLink}" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View & Sign Invoice
          </a>
        </div>
      `
    });

    // 3. Update status
    await prisma.invoice.update({
      where: { id: invoiceId },
      data: { status: 'SENT' }
    });

    revalidatePath("/dashboard/invoices");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: "Failed to send email" };
  }
}

export async function submitSignature(invoiceId: number, signatureData: string) {
  try {
    // 4. Double check if already signed to prevent overwriting
    const check = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      select: { isSigned: true }
    });

    if (check?.isSigned) return { success: false, error: "Already signed" };

    await prisma.invoice.update({
      where: { id: invoiceId },
      data: {
        signature: signatureData,
        isSigned: true,
        signedAt: new Date(),
        status: 'DRAFT' 
      }
    });

    revalidatePath(`/public/invoice/${invoiceId}`);
    revalidatePath("/dashboard/invoices"); // Refresh the dashboard too
    return { success: true };
  } catch (err) {
    return { success: false };
  }
}