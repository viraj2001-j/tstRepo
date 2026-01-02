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
import { Trash2, Plus } from "lucide-react"

interface Item {
  description: string;
  qty: number;
  rate: number;
}

interface ItemsProps {
  items: Item[];
  update: (newItems: Item[]) => void;
}

const InvoiceItemsCard = ({ items, update }: ItemsProps) => {
  
  // 📝 Update a specific field in a specific row
  const handleItemChange = (index: number, field: keyof Item, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    update(newItems);
  };

  // ➕ Add a new empty row
  const addItem = () => {
    update([...items, { description: "", qty: 1, rate: 0 }]);
  };

  // 🗑️ Remove a row
  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      update(newItems);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Items</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Table Headers */}
        <div className="grid grid-cols-12 gap-4 font-semibold text-sm px-2 text-muted-foreground">
          <div className="col-span-6">Description</div>
          <div className="col-span-2">Qty</div>
          <div className="col-span-2">Rate (LKR)</div>
          <div className="col-span-2 text-right">Amount</div>
        </div>

        {items.map((item, index) => (
          <div key={index} className="grid grid-cols-12 gap-4 items-center">
            <div className="col-span-6">
              <Input
                placeholder="Item description"
                value={item.description}
                onChange={(e) => handleItemChange(index, 'description', e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                placeholder="0"
                value={item.qty}
                onChange={(e) => handleItemChange(index, 'qty', Number(e.target.value))}
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                placeholder="0.00"
                value={item.rate}
                onChange={(e) => handleItemChange(index, 'rate', Number(e.target.value))}
              />
            </div>
            <div className="col-span-2 flex items-center justify-end gap-2">
              <span className="font-medium">
                {(item.qty * item.rate).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              {items.length > 1 && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => removeItem(index)}
                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed"
          onClick={addItem}
        >
          <Plus className="mr-2 h-4 w-4" /> Add New Item
        </Button>
      </CardContent>
    </Card>
  )
}

export default InvoiceItemsCard