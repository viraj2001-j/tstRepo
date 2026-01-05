"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, Trash2, Calendar as CalendarIcon } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { saveNewCategory, getCategories, deleteCategory } from "@/app/api/invoice/route"

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
  const [newCat, setNewCat] = useState("");
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    fetchCats();
  }, []);

  /**
   * 🟢 AUTO-CALCULATE DUE DATE
   * Runs only when invoiceDate changes. 
   * It sets the default to 15 days later, but the user can still change it manually.
   */
  useEffect(() => {
    if (data.invoiceDate) {
      const date = new Date(data.invoiceDate);
      date.setDate(date.getDate() + 15); 
      const formattedDueDate = date.toISOString().split('T')[0];
      
      // Only update if the due date is currently empty or just initialized
      if (!data.dueDate || data.dueDate === "") {
        update({ dueDate: formattedDueDate });
      }
    }
  }, [data.invoiceDate]);

  const fetchCats = async () => {
    try {
      const cats = await getCategories();
      setCategories(Array.isArray(cats) ? cats : []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const handleAddCategory = async () => {
    if (!newCat.trim()) return;
    setLoading(true);
    try {
      await saveNewCategory(newCat);
      await fetchCats();
      update({ category: newCat }); 
      setNewCat(""); 
    } catch (error) {
      console.error("Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCategory = async (e: React.MouseEvent, catName: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm(`Delete category "${catName}"?`)) return;
    try {
      await deleteCategory(catName);
      setCategories((prev) => prev.filter(c => c !== catName));
      if (data.category === catName) update({ category: "" });
    } catch (error) {
      console.error("Failed to delete category");
    }
  };

  return (
    <Card className="w-full border-slate-200 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-black text-slate-700 uppercase italic tracking-tight">
          Invoice Configurations
        </CardTitle>
      </CardHeader>
      
      <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* INVOICE NUMBER */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Invoice Number</Label>
          <Input 
            value={data.invoiceNumber}
            onChange={(e) => update({ invoiceNumber: e.target.value })}
            className="bg-slate-50/50 border-slate-200 focus:ring-blue-500 font-mono font-bold"
          />
        </div>

        {/* INVOICE DATE */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Issue Date</Label>
          <div className="relative">
            <Input 
              type="date" 
              value={data.invoiceDate}
              onChange={(e) => update({ invoiceDate: e.target.value })}
              className="bg-slate-50/50 border-slate-200 pr-10"
            />
          </div>
        </div>

        {/* DUE DATE (Manual Selection allowed) */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black text-blue-500 uppercase tracking-widest ml-1 flex items-center gap-1">
             <CalendarIcon size={10} /> Due Date (Calendar)
          </Label>
          <Input 
            type="date" 
            value={data.dueDate}
            onChange={(e) => update({ dueDate: e.target.value })}
            className="bg-blue-50/30 border-blue-100 focus:border-blue-400 font-semibold"
          />
        </div>

        {/* CURRENCY SELECT */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Billing Currency</Label>
          <Select 
            value={data.currency} 
            onValueChange={(val) => update({ currency: val })}
          >
            <SelectTrigger className="bg-slate-50/50 border-slate-200 font-bold">
              <SelectValue placeholder="Select Currency" />
            </SelectTrigger>
            <SelectContent className="font-bold">
              <SelectItem value="LKR">LKR (Rs.)</SelectItem>
              <SelectItem value="USD">USD ($)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* CATEGORY SELECT */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Service Category</Label>
          {mounted ? (
            <Select 
              value={data.category || ""} 
              onValueChange={(val: string) => update({ category: val })}
            >
              <SelectTrigger className="bg-slate-50/50 border-slate-200">
                <SelectValue placeholder="Choose Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <div key={cat} className="relative flex items-center group">
                      <SelectItem value={cat} className="flex-1 font-medium">
                        {cat}
                      </SelectItem>
                      <button
                        onClick={(e) => handleDeleteCategory(e, cat)}
                        className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 text-red-500 rounded transition-all z-50"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-4 text-[10px] text-slate-400 text-center italic">No categories saved.</div>
                )}
              </SelectContent>
            </Select>
          ) : (
            <div className="h-10 w-full border border-slate-200 rounded-md bg-slate-50 animate-pulse" />
          )}
        </div>

        {/* QUICK ADD CATEGORY */}
        <div className="space-y-1.5">
          <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Create Category</Label>
          <div className="flex gap-2">
            <Input 
              placeholder="New Category..." 
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
              className="bg-slate-50/50 border-slate-200"
            />
            <Button 
              type="button" 
              size="icon" 
              variant="secondary"
              onClick={handleAddCategory}
              disabled={loading}
              className="shrink-0"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}

export default InvoiceDetailsCard;