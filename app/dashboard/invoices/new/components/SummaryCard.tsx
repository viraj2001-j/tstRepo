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

interface SummaryProps {
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

const SummaryCard = ({ summary, update }: SummaryProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Subtotal Display */}
        <div className="flex justify-between text-sm border-b pb-2">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">LKR {summary.subtotal.toLocaleString()}</span>
        </div>

        {/* Tax Input */}
        <div className="space-y-2">
          <Label>Tax Rate (%)</Label>
          <Input 
            type="number"
            placeholder="0" 
            value={summary.taxRate}
            onChange={(e) => update({ taxRate: Number(e.target.value) })}
          />
        </div>

        {/* Discount Section */}
        <div className="space-y-2">
          <Label>Discount</Label>
          <div className="flex gap-2">
            <Input 
              type="number"
              placeholder="0" 
              className="flex-1"
              value={summary.discountValue}
              onChange={(e) => update({ discountValue: Number(e.target.value) })}
            />
            <select 
              className="border rounded p-2 text-sm bg-background"
              value={summary.discountType}
              onChange={(e) => update({ discountType: e.target.value })}
            >
              <option value="Amount">LKR</option>
              <option value="Percentage">%</option>
            </select>
          </div>
        </div>

        {/* Final Total */}
        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">Total Amount</span>
            <span className="text-xl font-bold text-blue-600">
              LKR {summary.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default SummaryCard