import prisma from "@/lib/db";
import { notFound } from "next/navigation";
import PublicInvoiceView from "./PublicInvoiceView";

// Note: Updated the type to Promise<{ id: string }>
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  
  // 1. Await the params to unwrap the promise
  const resolvedParams = await params;
  const id = resolvedParams.id;

  const invoiceId = parseInt(id);

  if (isNaN(invoiceId)) return notFound();

  // 2. Fetch the invoice
  const invoice = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      client: true,
      company: true,
      items: true,
      
    },
  });

  if (!invoice) return notFound();

  // 3. Render the Client Component
  return <PublicInvoiceView invoice={invoice} />;
}