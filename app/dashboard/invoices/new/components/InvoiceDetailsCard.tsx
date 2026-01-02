"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Plus, Loader2, Trash2 } from "lucide-react" // 👈 Added Trash2

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

// 👈 Added deleteCategory to your API
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
      await fetchCats(); // Refresh list from DB
      update({ category: newCat }); 
      setNewCat(""); 
    } catch (error) {
      console.error("Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  // 🟢 NEW: Delete Logic
  const handleDeleteCategory = async (e: React.MouseEvent, catName: string) => {
    e.preventDefault(); // Prevent dropdown from closing
    e.stopPropagation(); // Prevent the item from being selected
    
    if (!confirm(`Delete category "${catName}"?`)) return;

    try {
      await deleteCategory(catName);
      setCategories((prev) => prev.filter(c => c !== catName));
      if (data.category === catName) {
        update({ category: "" }); // Reset if the deleted one was selected
      }
    } catch (error) {
      console.error("Failed to delete category");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice Details</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-3 gap-4">
        {/* ... (Date and Number inputs remain same) ... */}
        <div className="space-y-2">
          <Label>Invoice Number</Label>
          <Input 
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
            value={data.currency}
            onChange={(e) => update({ currency: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label>Category</Label>
          {mounted ? (
            <Select 
              value={data.category || ""} 
              onValueChange={(val: string) => update({ category: val })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    // 🔄 Modified SelectItem to include a delete button
                    <div key={cat} className="relative flex items-center group">
                      <SelectItem value={cat} className="flex-1">
                        {cat}
                      </SelectItem>
                      <button
                        onClick={(e) => handleDeleteCategory(e, cat)}
                        className="absolute right-2 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 text-red-600 rounded-md transition-all z-50"
                        title="Delete category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="p-2 text-xs text-slate-500 text-center">No categories found</div>
                )}
              </SelectContent>
            </Select>
          ) : (
            <div className="h-10 w-full border border-slate-200 rounded-md bg-slate-50 animate-pulse" />
          )}
        </div>

        <div className="space-y-2">
          <Label>Add New Category</Label>
          <div className="flex gap-2">
            <Input 
              placeholder="e.g. Tech Support" 
              value={newCat}
              onChange={(e) => setNewCat(e.target.value)}
            />
            <Button 
              type="button" 
              size="icon" 
              variant="secondary"
              onClick={handleAddCategory}
              disabled={loading}
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