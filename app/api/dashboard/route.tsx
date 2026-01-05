// app/api/dashboard/route.ts
import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/db"



export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const timeRange = searchParams.get('timeRange') || '6m';

    // Calculate date ranges
    const now = new Date();
    const getStartDate = (range: string) => {
      const date = new Date();
      switch (range) {
        case '1m':
          date.setMonth(date.getMonth() - 1);
          break;
        case '3m':
          date.setMonth(date.getMonth() - 3);
          break;
        case '6m':
          date.setMonth(date.getMonth() - 6);
          break;
        case '1y':
          date.setFullYear(date.getFullYear() - 1);
          break;
        default:
          date.setMonth(date.getMonth() - 6);
      }
      return date;
    };

    const startDate = getStartDate(timeRange);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // 1. Get Total Revenue (sum of all PAID and PARTIAL invoices)
    const totalRevenueData = await prisma.invoice.aggregate({
      where: {
        status: { in: ['PAID', 'PARTIAL'] },
        createdAt: { gte: startDate }
      },
      _sum: { total: true }
    });

    // 2. Get Total Invoices Count
    const totalInvoices = await prisma.invoice.count({
      where: { createdAt: { gte: startDate } }
    });

    // 3. Get Active Clients (clients with at least one invoice in the time range)
    const activeClients = await prisma.client.count({
      where: {
        invoices: {
          some: {
            createdAt: { gte: startDate }
          }
        }
      }
    });

    // 4. Get Pending Amount (SENT + OVERDUE + PARTIAL balance)
    const pendingInvoices = await prisma.invoice.aggregate({
      where: {
        status: { in: ['SENT', 'OVERDUE', 'PARTIAL'] },
        createdAt: { gte: startDate }
      },
      _sum: { balanceAmount: true, total: true }
    });

    // 5. Get Overdue Count
    const overdueCount = await prisma.invoice.count({
      where: {
        status: 'OVERDUE',
        createdAt: { gte: startDate }
      }
    });

    // 6. Calculate Growth Percentages (compare current month vs last month)
    const lastMonthRevenue = await prisma.invoice.aggregate({
      where: {
        status: { in: ['PAID', 'PARTIAL'] },
        createdAt: { gte: lastMonthStart, lte: lastMonthEnd }
      },
      _sum: { total: true }
    });

    const currentMonthRevenue = await prisma.invoice.aggregate({
      where: {
        status: { in: ['PAID', 'PARTIAL'] },
        createdAt: { gte: currentMonthStart }
      },
      _sum: { total: true }
    });

    const lastMonthInvoices = await prisma.invoice.count({
      where: { createdAt: { gte: lastMonthStart, lte: lastMonthEnd } }
    });

    const currentMonthInvoices = await prisma.invoice.count({
      where: { createdAt: { gte: currentMonthStart } }
    });

    const lastMonthClients = await prisma.client.count({
      where: {
        invoices: {
          some: {
            createdAt: { gte: lastMonthStart, lte: lastMonthEnd }
          }
        }
      }
    });

    const currentMonthClients = await prisma.client.count({
      where: {
        invoices: {
          some: {
            createdAt: { gte: currentMonthStart }
          }
        }
      }
    });

    const calculateGrowth = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return ((current - previous) / previous) * 100;
    };

    // 7. Get Invoice Status Distribution
    const statusCounts = await prisma.invoice.groupBy({
      by: ['status'],
      where: { createdAt: { gte: startDate } },
      _count: true
    });

    const statusColors = {
      PAID: '#10b981',
      SENT: '#3b82f6',
      DRAFT: '#6b7280',
      OVERDUE: '#ef4444',
      PARTIAL: '#f59e0b'
    };

    const invoicesByStatus = statusCounts.map(item => ({
      name: item.status,
      value: item._count,
      color: statusColors[item.status] || '#6b7280'
    }));

    // 8. Get Revenue Chart Data (monthly breakdown)
    const getMonthlyData = async () => {
      const months = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      const numMonths = timeRange === '1m' ? 4 : timeRange === '3m' ? 3 : timeRange === '1y' ? 12 : 6;
      
      for (let i = numMonths - 1; i >= 0; i--) {
        const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);

        const revenue = await prisma.invoice.aggregate({
          where: {
            status: { in: ['PAID', 'PARTIAL'] },
            createdAt: { gte: monthStart, lte: monthEnd }
          },
          _sum: { total: true }
        });

        const invoiceCount = await prisma.invoice.count({
          where: { createdAt: { gte: monthStart, lte: monthEnd } }
        });

        months.push({
          month: monthNames[monthStart.getMonth()],
          revenue: revenue._sum.total || 0,
          invoices: invoiceCount
        });
      }

      return months;
    };

    // 9. Get Recent Invoices
    const recentInvoices = await prisma.invoice.findMany({
      take: 4,
      orderBy: { createdAt: 'desc' },
      include: { client: true },
      where: { createdAt: { gte: startDate } }
    });

    // 10. Get Top Clients by Revenue
    const topClientsData = await prisma.client.findMany({
      where: {
        invoices: {
          some: {
            createdAt: { gte: startDate },
            status: { in: ['PAID', 'PARTIAL'] }
          }
        }
      },
      include: {
        invoices: {
          where: {
            createdAt: { gte: startDate },
            status: { in: ['PAID', 'PARTIAL'] }
          },
          select: { total: true }
        }
      }
    });

    const topClients = topClientsData
      .map(client => ({
        name: client.name,
        revenue: client.invoices.reduce((sum, inv) => sum + inv.total, 0),
        invoices: client.invoices.length
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);

    const revenueChart = await getMonthlyData();

    // Prepare response
    const dashboardData = {
      stats: {
        totalRevenue: totalRevenueData._sum.total || 0,
        totalInvoices,
        activeClients,
        pendingAmount: pendingInvoices._sum.balanceAmount || pendingInvoices._sum.total || 0,
        revenueGrowth: calculateGrowth(
          currentMonthRevenue._sum.total || 0,
          lastMonthRevenue._sum.total || 0
        ),
        invoiceGrowth: calculateGrowth(currentMonthInvoices, lastMonthInvoices),
        clientGrowth: calculateGrowth(currentMonthClients, lastMonthClients),
        overdueCount
      },
      invoicesByStatus,
      revenueChart,
      recentInvoices: recentInvoices.map(inv => ({
        id: inv.invoiceNumber,
        client: inv.client.name,
        amount: inv.total,
        status: inv.status,
        date: inv.invoiceDate.toISOString().split('T')[0]
      })),
      topClients
    };

    return NextResponse.json(dashboardData);
  } catch (error) {
    console.error('Dashboard API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}