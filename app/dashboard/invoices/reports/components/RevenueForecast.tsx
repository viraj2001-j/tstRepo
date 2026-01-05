"use client"

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CalendarClock, ArrowUpRight } from "lucide-react";
import { format, differenceInDays } from "date-fns";

export default function RevenueForecast({ invoices }: { invoices: any[] }) {
  // 🟢 Logic: Calculate total expected revenue
  const totalForecast = useMemo(() => 
    invoices.reduce((sum, inv) => sum + inv.balanceAmount, 0), 
  [invoices]);

  return (
    <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
            14-Day Revenue Forecast
          </CardTitle>
          <CalendarClock size={16} className="text-blue-400" />
        </div>
        <div className="mt-2">
          <h3 className="text-2xl font-black italic tracking-tighter">
            LKR {totalForecast.toLocaleString()}
          </h3>
          <p className="text-[9px] font-bold text-slate-400 uppercase">Projected Inflow</p>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 pt-4">
        <div className="space-y-3">
          {invoices.length > 0 ? (
            invoices.slice(0, 4).map((inv, i) => {
              const daysLeft = differenceInDays(new Date(inv.dueDate), new Date());
              // Calculate "urgency" for the progress bar
              const progressValue = Math.max(0, 100 - (daysLeft * 7)); 

              return (
                <div key={i} className="space-y-1">
                  <div className="flex justify-between text-[10px] font-bold uppercase tracking-tight">
                    <span className="text-slate-300 truncate w-32">{inv.client.name}</span>
                    <span className="text-blue-400">Due in {daysLeft}d</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Progress value={progressValue} className="h-1 bg-slate-800" />
                    <span className="text-[10px] font-black whitespace-nowrap">
                      {inv.balanceAmount.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="py-8 text-center">
              <p className="text-[10px] font-bold uppercase text-slate-500 italic">No incoming payments scheduled</p>
            </div>
          )}
        </div>

        {invoices.length > 4 && (
          <div className="pt-2 border-t border-slate-800 flex justify-center">
            <button className="text-[9px] font-black uppercase text-slate-400 hover:text-white transition-colors flex items-center gap-1">
              View full schedule <ArrowUpRight size={10} />
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}