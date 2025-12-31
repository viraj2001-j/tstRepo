"use client"

import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus } from "lucide-react"

interface DetailsProps {
  data: {
    invoiceNumber: string;
    invoiceDate: string;
    dueDate: string;
    currency: string;
    category: string;
  };
  update: (fields: Partial<DetailsProps['data']>) => void;
}

const InvoiceDetailsCard = ({ data, update }: DetailsProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Details</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Invoice Number</Label>
          <Input 
            placeholder="INV-001" 
            value={data.invoiceNumber}
            onChange={(e) => update({ invoiceNumber: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Invoice Date</Label>
          <Input 
            type="date" 
            value={data.invoiceDate}
            onChange={(e) => update({ invoiceDate: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Due Date</Label>
          <Input 
            type="date" 
            value={data.dueDate}
            onChange={(e) => update({ dueDate: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Currency</Label>
          <Input 
            placeholder="LKR" 
            value={data.currency}
            onChange={(e) => update({ currency: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          <Input 
            placeholder="Consulting / Service" 
            value={data.category}
            onChange={(e) => update({ category: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Add New Category</Label>
          <div className="flex gap-2">
            <Input placeholder="Tech Support" />
            <Button type="button" size="icon" variant="secondary">
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default InvoiceDetailsCard