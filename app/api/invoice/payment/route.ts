"use server"

import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";
// import { InvoiceStatus } from "@/app/generated/prisma/enums";
import { InvoiceStatus } from "@/app/generated/prisma/client";



/**
 * 🟢 RECORD A NEW PAYMENT
 * Creates a payment and updates the invoice balance/status.
 */
export async function recordPaymentAction({
  invoiceId,
  amount,
  method,
  paymentDate,
  note = "Manual payment entry"
}: {
  invoiceId: number;
  amount: number;
  method: string;
  paymentDate: string;
  note?: string;
}) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create the Payment record
      const payment = await tx.payment.create({
        data: {
          invoiceId,
          amount,
          method,
          paymentDate: new Date(paymentDate),
          note
        }
      });

      // 2. Fetch current invoice to calculate new totals
      const invoice = await tx.invoice.findUnique({
        where: { id: invoiceId }
      });

      if (!invoice) throw new Error("Invoice not found");

      const newAmountPaid = invoice.amountPaid + amount;
      const newBalance = Math.max(0, invoice.total - newAmountPaid);

      // 3. Determine new status based on math
      let newStatus: InvoiceStatus = InvoiceStatus.PARTIAL;
      if (newBalance <= 0) {
        newStatus = InvoiceStatus.PAID;
      }

      // 4. Update the Invoice Master record
      await tx.invoice.update({
        where: { id: invoiceId },
        data: {
          amountPaid: newAmountPaid,
          balanceAmount: newBalance,
          status: newStatus
        }
      });

      return payment;
    });

    revalidatePath("/dashboard/invoices/payment");
    return { success: true, data: result };
  } catch (error: any) {
    console.error("Payment Error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * 🟡 UPDATE AN EXISTING PAYMENT
 * Adjusts the math by "undoing" the old amount and applying the new one.
 */
export async function updatePaymentAction({
  paymentId,
  amount,
  method,
  paymentDate
}: {
  paymentId: number;
  amount: number;
  method: string;
  paymentDate: string;
}) {
  try {
    await prisma.$transaction(async (tx) => {
      const oldPayment = await tx.payment.findUnique({ where: { id: paymentId } });
      if (!oldPayment) throw new Error("Payment record not found");

      const invoice = await tx.invoice.findUnique({ where: { id: oldPayment.invoiceId } });
      if (!invoice) throw new Error("Invoice not found");

      // Math: [Existing Total Paid] - [Old Payment] + [New Payment]
      const newAmountPaid = Math.max(0, (invoice.amountPaid - oldPayment.amount) + amount);
      const newBalance = Math.max(0, invoice.total - newAmountPaid);

      // Status Logic
      let newStatus: InvoiceStatus = InvoiceStatus.PARTIAL;
      if (newBalance <= 0) newStatus = InvoiceStatus.PAID;
      if (newAmountPaid <= 0) newStatus = InvoiceStatus.SENT;

      await tx.payment.update({
        where: { id: paymentId },
        data: { 
          amount, 
          method, 
          paymentDate: new Date(paymentDate) 
        }
      });

      await tx.invoice.update({
        where: { id: invoice.id },
        data: { 
          amountPaid: newAmountPaid, 
          balanceAmount: newBalance, 
          status: newStatus 
        }
      });
    });

    revalidatePath("/dashboard/invoices/payment");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 🔴 DELETE A PAYMENT
 * Reverts the invoice balance and status to what it was before the payment.
 */
export async function deletePaymentAction(paymentId: number) {
  try {
    await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({ where: { id: paymentId } });
      if (!payment) throw new Error("Payment record not found");

      const invoice = await tx.invoice.findUnique({ where: { id: payment.invoiceId } });
      
      if (invoice) {
        const newAmountPaid = Math.max(0, invoice.amountPaid - payment.amount);
        const newBalance = invoice.total - newAmountPaid;
        
        await tx.invoice.update({
          where: { id: invoice.id },
          data: {
            amountPaid: newAmountPaid,
            balanceAmount: newBalance,
            status: newAmountPaid === 0 ? InvoiceStatus.SENT : InvoiceStatus.PARTIAL
          }
        });
      }

      await tx.payment.delete({ where: { id: paymentId } });
    });

    revalidatePath("/dashboard/invoices/payment");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

const invoices = await prisma.invoice.findMany({
  include: {
    client: true,
    payments: {
      orderBy: {
        paymentDate: 'desc' // 🟢 Shows newest payments first
      }
    }
  }
})