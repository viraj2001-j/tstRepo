"use client"

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function MainCharts({ trend, status }: any) {
  const pieData = status.map((s: any) => ({ name: s.status, value: s._count.id }));
  const COLORS = ['#0f172a', '#22c55e', '#ef4444', '#f97316', '#3b82f6'];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      <Card className="lg:col-span-8 border-none shadow-xl bg-white overflow-hidden rounded-2xl">
        <CardHeader className="border-b bg-slate-50/50 py-4">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Revenue Flow Trend</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] pt-6">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trend}>
              <XAxis dataKey="paymentDate" hide />
              <YAxis tick={{fontSize: 10, fontWeight: 900}} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}} />
              <Area type="monotone" dataKey="amount" stroke="#0f172a" strokeWidth={3} fill="#0f172a" fillOpacity={0.05} />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card className="lg:col-span-4 border-none shadow-xl bg-white overflow-hidden rounded-2xl">
        <CardHeader className="border-b bg-slate-50/50 py-4">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Status breakdown</CardTitle>
        </CardHeader>
        <CardContent className="h-[400px] flex flex-col items-center justify-center">
          <ResponsiveContainer width="100%" height="70%">
            <PieChart>
              <Pie data={pieData} innerRadius={60} outerRadius={90} dataKey="value" stroke="none">
                {pieData.map((_:any, i:number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 mt-4">
             {pieData.map((entry: any, i: number) => (
               <div key={i} className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                 <span className="text-[9px] font-black uppercase text-slate-500">{entry.name}</span>
               </div>
             ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}