import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import nodemailer from "nodemailer";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function POST(req: Request) {
  try {
    const { invoiceId, clientEmail } = await req.json();

    const invoice = await prisma.invoice.findUnique({
      where: { id: invoiceId },
      include: { 
        client: true,
        payments: { orderBy: { paymentDate: 'asc' } } 
      }
    });

    if (!invoice || !clientEmail) {
      return NextResponse.json({ error: "Data missing" }, { status: 400 });
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(22).setFont("helvetica", "bold").text("LUCIFER.", 14, 20);
    doc.setFontSize(10).text("ACCOUNT STATEMENT", 14, 28);
    
    doc.setFontSize(10).text(`Invoice: #${invoice.invoiceNumber}`, 140, 20);
    doc.text(`Client: ${invoice.client.name}`, 140, 26);

    // Table of ALL payments
    autoTable(doc, {
      startY: 40,
      head: [['Date', 'Method', 'Amount']],
      body: invoice.payments.map((p) => [
        new Date(p.paymentDate).toLocaleDateString(),
        p.method,
        `${invoice.currency} ${p.amount.toLocaleString()}`
      ]),
      headStyles: { fillColor: [30, 41, 59] },
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    doc.setFont("helvetica", "bold").text(`Total Billed: ${invoice.currency} ${invoice.total.toLocaleString()}`, 140, finalY);
    doc.text(`Total Paid: ${invoice.currency} ${invoice.amountPaid.toLocaleString()}`, 140, finalY + 7);
    
    const balance = invoice.total - invoice.amountPaid;
    doc.setTextColor(220, 38, 38).text(`Outstanding: ${invoice.currency} ${balance.toLocaleString()}`, 140, finalY + 14);

    // Signature
    doc.setTextColor(0).text("Authorized Signature:", 14, finalY + 25);
    doc.line(14, finalY + 40, 60, finalY + 40);

    const buffer = Buffer.from(doc.output("arraybuffer"));

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: process.env.GMAIL_USER, pass: process.env.GMAIL_APP_PASSWORD },
    });

    await transporter.sendMail({
      from: `"Lucifer Accounts" <${process.env.GMAIL_USER}>`,
      to: clientEmail,
      subject: `Account Statement: #${invoice.invoiceNumber}`,
      text: `Dear ${invoice.client.name},\n\nPlease find your complete account statement attached.`,
      attachments: [{ filename: `Statement_${invoice.invoiceNumber}.pdf`, content: buffer }],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}