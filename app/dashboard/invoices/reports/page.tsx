import { getAnalyticsData } from "@/lib/analyticsdata";
import ReportsDashboard from "./ReportsDashboard";
import Sidebar from "@/components/sidebar";
import prisma from "@/lib/db";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ clientId?: string; range?: string }>;
}) {
  // 🟢 FIX: Unwrapping the searchParams Promise
  const params = await searchParams;

  const filters = {
    clientId: params.clientId ? parseInt(params.clientId) : undefined,
    dateRange: params.range || "last6months",
  };

  const data = await getAnalyticsData(filters);
  const clients = await prisma.client.findMany({
    select: { id: true, name: true },
    orderBy: { name: 'asc' }
  });

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-8">
          <ReportsDashboard initialData={data} clients={clients} />
        </div>
      </main>
    </div>
  );
}