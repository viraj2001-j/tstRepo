"use client"

import React, { useState, useMemo } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Clock, Search, X } from "lucide-react";
import { differenceInDays, format } from "date-fns";

export default function ActivityTabs({ data }: { data: any }) {
  const [searchQuery, setSearchQuery] = useState("");

  // 🟢 1. Logic: Filter Recent Activity based on search
  const filteredRecent = useMemo(() => {
    return data.overdueInvoices.filter((inv: any) => 
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.client?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, data.overdueInvoices]);

  // 🟢 2. Logic: Calculate Aging Buckets (remains constant)
  const agingBuckets = useMemo(() => {
    return data.overdueInvoices.reduce((acc: any, inv: any) => {
      const daysOverdue = differenceInDays(new Date(), new Date(inv.dueDate));
      if (daysOverdue <= 30) acc["0-30"] += inv.balanceAmount;
      else if (daysOverdue <= 60) acc["31-60"] += inv.balanceAmount;
      else if (daysOverdue <= 90) acc["61-90"] += inv.balanceAmount;
      else acc["90+"] += inv.balanceAmount;
      return acc;
    }, { "0-30": 0, "31-60": 0, "61-90": 0, "90+": 0 });
  }, [data.overdueInvoices]);

  return (
    <Tabs defaultValue="recent" className="w-full">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4">
        <TabsList className="bg-slate-100 p-1 w-fit">
          <TabsTrigger value="recent" className="text-[10px] font-black uppercase">Recent Activity</TabsTrigger>
          <TabsTrigger value="aging" className="text-[10px] font-black uppercase">Aging Report</TabsTrigger>
        </TabsList>

        {/* 🟢 3. Search Bar specifically for this Tab Section */}
        <div className="relative group w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" size={14} />
          <Input 
            placeholder="Quick find invoice..." 
            className="pl-9 pr-8 h-8 text-[11px] font-bold border-slate-200 focus-visible:ring-slate-900 transition-all placeholder:text-slate-400 italic"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"
            >
              <X size={12} strokeWidth={3} />
            </button>
          )}
        </div>
      </div>

      <TabsContent value="recent">
        <Card className="border-none shadow-xl bg-white">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead className="text-[10px] font-black uppercase italic">Invoice #</TableHead>
                  <TableHead className="text-[10px] font-black uppercase italic">Client</TableHead>
                  <TableHead className="text-[10px] font-black uppercase italic">Delay</TableHead>
                  <TableHead className="text-right text-[10px] font-black uppercase italic">Balance</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRecent.length > 0 ? (
                  filteredRecent.slice(0, 10).map((inv: any, i: number) => (
                    <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-bold text-xs">#{inv.invoiceNumber}</TableCell>
                      <TableCell className="text-xs font-medium text-slate-600">{inv.client?.name ?? "Global Client"}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5 text-red-600">
                          <Clock size={12} strokeWidth={3} />
                          <span className="text-[10px] font-black uppercase italic">
                            {differenceInDays(new Date(), new Date(inv.dueDate))} Days Late
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-black text-xs">LKR {inv.balanceAmount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center italic text-slate-400 text-[10px] font-black uppercase">
                      No matching records found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="aging">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Object.entries(agingBuckets).map(([label, amount]: any) => (
            <Card key={label} className="border-none shadow-md bg-white hover:ring-2 ring-red-500/20 transition-all">
              <CardContent className="p-6 text-center">
                <p className="text-[10px] font-black uppercase text-slate-400 mb-1">{label} Days Overdue</p>
                <h4 className={`text-lg font-black italic ${amount > 0 ? 'text-red-600' : 'text-slate-300'}`}>
                  LKR {amount.toLocaleString()}
                </h4>
              </CardContent>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
}