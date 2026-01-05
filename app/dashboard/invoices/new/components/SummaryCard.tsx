"use client"

import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface SummaryProps {
  // 🟢 Added currency here so the card knows if it's LKR or USD
  currency: string; 
  summary: {
    subtotal: number;
    taxRate: number;
    taxAmount: number;
    discountType: string;
    discountValue: number;
    total: number;
  };
  update: (fields: Partial<SummaryProps['summary']>) => void;
}

const SummaryCard = ({ summary, update, currency }: SummaryProps) => {
  return (
    <Card className="w-full border-slate-200 shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg font-black text-slate-700 uppercase italic tracking-tight">
          Financial Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        
        {/* Subtotal Display */}
        <div className="flex justify-between items-center text-sm border-b border-slate-100 pb-3">
          <span className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Gross Subtotal</span>
          <span className="font-mono font-bold text-slate-900">
            {currency} {summary.subtotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Tax Input */}
          <div className="space-y-1.5">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tax Rate (%)</Label>
            <Input 
              type="number"
              placeholder="0" 
              value={summary.taxRate}
              onChange={(e) => update({ taxRate: Number(e.target.value) })}
              className="bg-slate-50/50 font-bold"
            />
          </div>

          {/* Tax Amount Display (Read Only) */}
          <div className="space-y-1.5 text-right">
            <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Calculated Tax</Label>
            <div className="h-10 flex items-center justify-end font-mono text-sm font-bold text-slate-600 px-3 bg-slate-50/30 rounded-md border border-dashed border-slate-200">
              +{currency} {summary.taxAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
          </div>
        </div>

        {/* Discount Section */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Discount Adjustments</Label>
          <div className="flex gap-2">
            <Input 
              type="number"
              placeholder="0" 
              className="flex-1 bg-slate-50/50 font-bold"
              value={summary.discountValue}
              onChange={(e) => update({ discountValue: Number(e.target.value) })}
            />
            
            <Select 
              value={summary.discountType} 
              onValueChange={(val) => update({ discountType: val })}
            >
              <SelectTrigger className="w-[100px] font-bold bg-white border-slate-200">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent className="font-bold">
                <SelectItem value="Amount">{currency}</SelectItem>
                <SelectItem value="Percentage">% Percent</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Final Total */}
        <div className="pt-6 border-t-2 border-slate-100 mt-4">
          <div className="flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Net Payable Amount</span>
              <span className="text-2xl font-black text-slate-900 tracking-tighter italic">TOTAL</span>
            </div>
            <div className="text-right">
              <span className="text-3xl font-black text-blue-600 font-mono">
                {currency} {summary.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SummaryCard