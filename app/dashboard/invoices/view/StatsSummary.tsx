"use client"

import React from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { FileText, Banknote, CheckCircle, Clock, AlertCircle } from "lucide-react"

interface StatsProps {
  stats: {
    totalInvoices: number;
    totalAmount: number;
    paidCount: number;
    pendingCount: number;
    overdueCount: number;
  }
}

export default function StatsSummary({ stats }: StatsProps) {
  const data = [
    { title: "Total Invoices", value: stats.totalInvoices, icon: <FileText size={18}/>, color: "blue" },
    { title: "Total Amount", value: `Rs. ${stats.totalAmount.toLocaleString()}`, icon: <Banknote size={18}/>, color: "indigo" },
    { title: "Paid Invoices", value: stats.paidCount, icon: <CheckCircle size={18}/>, color: "green" },
    { title: "Pending", value: stats.pendingCount, icon: <Clock size={18}/>, color: "yellow" },
    { title: "Overdue", value: stats.overdueCount, icon: <AlertCircle size={18}/>, color: "red" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {data.map((item, idx) => (
        <Card key={idx} className="border-none shadow-sm overflow-hidden bg-white">
          <CardContent className="p-4 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${getTheme(item.color)}`}>
              {item.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider leading-tight">
                {item.title}
              </p>
              <p className="text-lg font-black text-slate-800 leading-none mt-1.5">
                {item.value}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function getTheme(color: string) {
  const themes: any = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    yellow: "text-yellow-600 bg-yellow-50",
    red: "text-red-600 bg-red-50",
    indigo: "text-indigo-600 bg-indigo-50",
  };
  return themes[color];
}