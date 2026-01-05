"use client";

import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, FileText, Calendar } from "lucide-react";
import { differenceInDays } from "date-fns";

// Component Imports
import KPIGrid from "./components/KPIGrid";
import MainCharts from "./components/MainCharts";
import ActivityTabs from "./components/ActivityTabs";
import TopClients from './components/TopClients';
import RecentActivity from "./components/RecentActivity";
import RevenueForecast from './components/RevenueForecast';

// Utility Imports
import { downloadAnalyticsCSV } from "@/lib/csvGenerator";
import { generateExecutiveReport } from "@/lib/reportGenerator";
import { Badge } from '@/components/ui/badge';

interface Props {
  initialData: any;
  clients: { id: number; name: string }[];
}

export default function ReportsDashboard({ initialData, clients }: Props) {
  const [timeRange, setTimeRange] = useState('180');

  // 🟢 1. Memoized Financial Calculations for Exports
  const kpiCalculations = useMemo(() => ({
    totalRevenue: initialData.kpiData._sum.total || 0,
    totalPaid: initialData.kpiData._sum.amountPaid || 0,
    totalOwed: initialData.kpiData._sum.balanceAmount || 0,
    avgInvoice: initialData.kpiData._avg.total || 0,
    collectionRate: initialData.kpiData._sum.total > 0 
      ? (initialData.kpiData._sum.amountPaid / initialData.kpiData._sum.total) * 100 
      : 0,
  }), [initialData.kpiData]);

  const agingBuckets = useMemo(() => {
    return initialData.overdueInvoices.reduce((acc: any, inv: any) => {
      const daysOverdue = differenceInDays(new Date(), new Date(inv.dueDate));
      if (daysOverdue <= 30) acc["0-30"] += inv.balanceAmount;
      else if (daysOverdue <= 60) acc["31-60"] += inv.balanceAmount;
      else if (daysOverdue <= 90) acc["61-90"] += inv.balanceAmount;
      else acc["90+"] += inv.balanceAmount;
      return acc;
    }, { "0-30": 0, "31-60": 0, "61-90": 0, "90+": 0 });
  }, [initialData.overdueInvoices]);

  return (
    <div className="min-h-screen bg-gray-50/50 space-y-8 pb-12">
      {/* 🟢 HEADER & CONTROLS */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 rounded-b-2xl shadow-sm">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-gradient-to-br from-red-600 to-red-800 p-2 rounded-lg shadow-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black italic tracking-tighter text-slate-900 uppercase leading-none">
                LUCIFER<span className="text-red-600">.</span> ANALYTICS
              </h1>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">Enterprise Command Center</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 rounded-lg border border-gray-200">
               <Calendar className="w-3.5 h-3.5 text-gray-500" />
               <span className="text-[10px] font-bold text-gray-600 uppercase">{new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            
            <Select defaultValue="all-clients">
              <SelectTrigger className="w-[160px] bg-white h-9 text-xs font-bold border-gray-200">
                <SelectValue placeholder="All Clients" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-clients">Global Filter</SelectItem>
                {clients.map(c => (
                  <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="h-6 w-[1px] bg-gray-200 mx-1" />

            <Button 
              variant="default" 
              size="sm" 
              className="h-9 gap-2 font-black uppercase italic bg-slate-900 text-white shadow-md hover:bg-slate-800 active:scale-95 transition-all"
              onClick={() => generateExecutiveReport(kpiCalculations, agingBuckets)}
            >
              <FileText size={14} /> Report
            </Button>

            <Button 
              variant="outline" 
              size="sm" 
              className="h-9 gap-2 font-bold text-xs border-gray-200 bg-white hover:bg-gray-50 shadow-sm"
              onClick={() => downloadAnalyticsCSV(initialData)}
            >
              <Download size={14} /> CSV
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 space-y-8">
        {/* 🟢 ROW 1: KPI GRID */}
        <section>
          <KPIGrid stats={initialData.kpiData} />
        </section>

        {/* 🟢 ROW 2: MAIN ANALYTICS & FORECAST */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8">
            <MainCharts 
              trend={initialData.payments} 
              status={initialData.statusDistribution} 
            />
          </div>
          <div className="lg:col-span-4">
            <RevenueForecast invoices={initialData.upcomingInvoices} />
          </div>
        </div>

        {/* 🟢 ROW 3: CLIENTS & RECENT ACTIVITY */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <TopClients data={initialData.topClients} />
          <RecentActivity invoices={initialData.recentInvoices} />
        </div>

        {/* 🟢 ROW 4: AGING & DEEP DIVE */}
        <section className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              Financial Ledger Breakdown
              <Badge variant="outline" className="text-[10px] font-black uppercase text-blue-600 bg-blue-50">Advanced Analysis</Badge>
            </h2>
          </div>
          <ActivityTabs data={initialData} />
        </section>
      </div>
    </div>
  );
}