"use client"

import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, CheckCircle2, AlertCircle, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";

export default function KPIGrid({ stats }: any) {
  const kpis = [
    { title: "Total Revenue", val: stats._sum.total, icon: <TrendingUp size={20}/>, color: "text-blue-600", trend: "+12%" },
    { title: "Total Collected", val: stats._sum.amountPaid, icon: <CheckCircle2 size={20}/>, color: "text-green-600", trend: "+5%" },
    { title: "Outstanding", val: stats._sum.balanceAmount, icon: <AlertCircle size={20}/>, color: "text-red-600", trend: "+2%" },
    { title: "Avg. Invoice", val: stats._avg.total, icon: <DollarSign size={20}/>, color: "text-slate-600", trend: "-1%" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <Card key={i} className="border-none shadow-xl bg-white overflow-hidden group hover:ring-2 ring-red-500/10 transition-all">
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2.5 bg-slate-50 rounded-xl group-hover:bg-slate-900 group-hover:text-white transition-colors duration-300">
                {kpi.icon}
              </div>
              <div className={`flex items-center text-[10px] font-black ${i < 2 ? 'text-green-600' : 'text-red-600'}`}>
                {i < 2 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />} {kpi.trend}
              </div>
            </div>
            <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest leading-none mb-1">{kpi.title}</p>
            <h3 className="text-2xl font-black italic text-slate-900 tracking-tighter uppercase">LKR {kpi.val?.toLocaleString()}</h3>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}