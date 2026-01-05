"use client"

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { format } from "date-fns";

export default function RecentActivity({ invoices }: { invoices: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");

  // 🟢 Logic: Filter invoices based on Search Term
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => 
      inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, invoices]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-50 text-green-700 border-green-200';
      case 'OVERDUE': return 'bg-red-50 text-red-700 border-red-200';
      case 'PARTIAL': return 'bg-blue-50 text-blue-700 border-blue-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  return (
    <Card className="border-none shadow-xl bg-white overflow-hidden">
      <CardHeader className="border-b bg-slate-50/50 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">
            Recent Invoice Activity
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-[9px] font-bold h-5 px-1.5">
              {filteredInvoices.length} Found
            </Badge>
          </div>
        </div>

        {/* 🟢 SEARCH BAR WITH CLEAR BUTTON */}
        <div className="relative group">
          <Search 
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-900 transition-colors" 
            size={14} 
          />
          <Input 
            placeholder="Search by Invoice # or Client name..." 
            className="pl-9 pr-10 h-9 text-xs font-bold border-slate-200 focus-visible:ring-slate-900 transition-all placeholder:text-slate-400 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500 transition-colors"
              aria-label="Clear search"
            >
              <X size={14} strokeWidth={3} />
            </button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="max-h-[400px] overflow-y-auto">
          <Table>
            <TableHeader className="bg-slate-50/50 sticky top-0 z-10 backdrop-blur-sm">
              <TableRow className="hover:bg-transparent">
                <TableHead className="text-[9px] font-black uppercase italic">Invoice #</TableHead>
                <TableHead className="text-[9px] font-black uppercase italic">Client</TableHead>
                <TableHead className="text-[9px] font-black uppercase italic">Date</TableHead>
                <TableHead className="text-[9px] font-black uppercase italic">Status</TableHead>
                <TableHead className="text-right text-[9px] font-black uppercase italic">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length > 0 ? (
                filteredInvoices.map((inv) => (
                  <TableRow key={inv.id} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-bold text-xs text-slate-900">
                      {inv.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-600">
                      {inv.client.name}
                    </TableCell>
                    <TableCell className="text-[10px] text-slate-400 font-bold uppercase">
                      {format(new Date(inv.createdAt), "dd MMM, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={`text-[8px] font-black uppercase px-1.5 h-4 leading-none ${getStatusStyle(inv.status)}`}
                      >
                        {inv.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-black text-xs text-slate-900 italic">
                      {inv.currency} {inv.total.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <div className="flex flex-col items-center justify-center space-y-2">
                       <Search size={24} className="text-slate-200" />
                       <p className="text-xs font-bold uppercase text-slate-400 italic">
                          No matching activity found
                       </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}