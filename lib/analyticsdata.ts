import prisma from "@/lib/db";
import { startOfMonth, subMonths } from "date-fns";
import { addDays, startOfDay, endOfDay } from "date-fns";

export async function getAnalyticsData(filters: { clientId?: number; dateRange?: string }) {
  const now = new Date();
  const sixMonthsAgo = startOfMonth(subMonths(now, 5));

  const today = startOfDay(new Date());
  const fourteenDaysFromNow = endOfDay(addDays(today, 14));

  // KPI Aggregates
  const kpiData = await prisma.invoice.aggregate({
    _sum: { total: true, amountPaid: true, balanceAmount: true },
    _avg: { total: true },
    _count: { id: true },
    where: {
      ...(filters.clientId && { clientId: filters.clientId }),
    }
  });

  // Status Distribution
  const statusDistribution = await prisma.invoice.groupBy({
    by: ['status'],
    _count: { id: true },
    _sum: { total: true }
  });

  // Revenue Trend
  const payments = await prisma.payment.findMany({
    where: { paymentDate: { gte: sixMonthsAgo } },
    select: { amount: true, paymentDate: true },
    orderBy: { paymentDate: 'asc' }
  });

  // Overdue Invoices for Aging and Activity
  const overdueInvoices = await prisma.invoice.findMany({
    where: { status: 'OVERDUE', balanceAmount: { gt: 0 } },
    select: { balanceAmount: true, dueDate: true, invoiceNumber: true, total: true },
    orderBy: { dueDate: 'desc' }
  });

const topClientsData = await prisma.client.findMany({
  take: 5,
  select: {
    name: true,
    invoices: {
      where: {
        status: { not: 'DRAFT' } // Typically exclude drafts from revenue
      },
      select: {
        total: true
      }
    }
  }
});

const data = topClientsData.map(client => ({
  name: client.name,
  value: client.invoices.reduce((sum, inv) => sum + inv.total, 0)
})).sort((a, b) => b.value - a.value);

  const recentInvoices = await prisma.invoice.findMany({
    take: 10,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      client: {
        select: { name: true }
      }
    }
  });

  const recentPayments = await prisma.payment.findMany({
    take: 10,
    orderBy: {
      paymentDate: 'desc',
    },
    include: {
      invoice: {
        select: {
          invoiceNumber: true,
          currency: true,
          client: {
            select: { name: true }
          }
        }
      }
    }
  });

  const upcomingInvoices = await prisma.invoice.findMany({
    where: {
      status: { in: ['SENT', 'PARTIAL'] },
      dueDate: {
        gte: today,
        lte: fourteenDaysFromNow
      },
      balanceAmount: { gt: 0 }
    },
    include: {
      client: { select: { name: true } }
    },
    orderBy: { dueDate: 'asc' }
  });


  return { kpiData, statusDistribution, payments, overdueInvoices, topClients: data, recentInvoices, recentPayments, upcomingInvoices};
}