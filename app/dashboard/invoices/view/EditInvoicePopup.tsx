"use client"

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select" // 👈 Added Select imports
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { 
  Save, Plus, Trash2, Building2, User, 
  FileText, CreditCard, Layout, Percent 
} from "lucide-react"
import { updateFullInvoiceAction } from "@/app/api/invoice/view/edit/route"
import { getCategories } from "@/app/api/invoice/route" // 👈 Added Category fetcher

export default function EditInvoicePopup({ invoice, isOpen, onClose }: any) {
  const [formData, setFormData] = useState<any>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (invoice) {
      setFormData({ ...invoice });
    }
    
    // Fetch categories for the dropdown
    const fetchCats = async () => {
      const cats = await getCategories();
      setCategories(Array.isArray(cats) ? cats : []);
    };
    fetchCats();
  }, [invoice, isOpen]);

  if (!formData) return null;

  // --- CALCULATION LOGIC ---
  const handleCalculation = (items: any[], taxRate: number, discount: number) => {
    const subtotal = items.reduce((sum, item) => sum + (item.amount || 0), 0);
    const taxAmount = (subtotal * (taxRate || 0)) / 100;
    const total = (subtotal + taxAmount) - (discount || 0);
    return { subtotal, taxAmount, total };
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const updatedItems = [...formData.items];
    let finalValue = value;

    if (field === "rate" || field === "quantity") {
      finalValue = isNaN(value) || value === "" ? 0 : value;
    }

    updatedItems[index] = { ...updatedItems[index], [field]: finalValue };

    if (field === "rate" || field === "quantity") {
      updatedItems[index].amount = updatedItems[index].rate * updatedItems[index].quantity;
    }

    const { subtotal, taxAmount, total } = handleCalculation(updatedItems, formData.taxRate, formData.discountValue);
    setFormData({ ...formData, items: updatedItems, subtotal, taxAmount, total });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: "", quantity: 1, rate: 0, amount: 0 }]
    });
  };

  const removeItem = (index: number) => {
    const updatedItems = formData.items.filter((_: any, i: number) => i !== index);
    const { subtotal, taxAmount, total } = handleCalculation(updatedItems, formData.taxRate, formData.discountValue);
    setFormData({ ...formData, items: updatedItems, subtotal, taxAmount, total });
  };

  const handleSave = async () => {
    const response = await updateFullInvoiceAction(formData.id, formData);
    if (response.success) {
      alert("All records updated successfully.");
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-[100vh] w-[100vh] max-h-[95vh] overflow-y-auto p-0 gap-0 border-none shadow-2xl"
        style={{ maxWidth: '100vh' }} 
      >
        <DialogHeader className="p-6 bg-slate-950 text-white flex flex-row items-center justify-between space-y-0">
          <DialogTitle className="text-xl font-black uppercase tracking-widest flex items-center gap-2 italic">
            <Layout className="text-blue-500" /> System Update <span className="text-blue-500">/</span> {formData.invoiceNumber}
          </DialogTitle>
        </DialogHeader>

        <div className="p-8 space-y-12 bg-white">
          {/* COMPANY & CLIENT INFO SECTIONS (Same as your previous code) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                <Building2 size={18} className="text-blue-600" />
                <h3 className="font-black uppercase text-sm tracking-tighter">Company Profile</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <Label className="text-[10px] font-bold text-slate-400">Company Name</Label>
                  <Input value={formData.company?.name || ""} onChange={(e) => setFormData({...formData, company: {...formData.company, name: e.target.value}})} />
                </div>
                <div className="space-y-1 text-blue-600">
                  <Label className="text-[10px] font-bold">Project Name</Label>
                  <Input value={formData.company?.project || ""} onChange={(e) => setFormData({...formData, company: {...formData.company, project: e.target.value}})} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold">Company Phone</Label>
                  <Input value={formData.company?.phone || ""} onChange={(e) => setFormData({...formData, company: {...formData.company, phone: e.target.value}})} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-[10px] font-bold">Company Email</Label>
                  <Input value={formData.company?.email || ""} onChange={(e) => setFormData({...formData, company: {...formData.company, email: e.target.value}})} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-[10px] font-bold">Office Address</Label>
                  <Input value={formData.company?.address || ""} onChange={(e) => setFormData({...formData, company: {...formData.company, address: e.target.value}})} />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-900 pb-2">
                <User size={18} className="text-blue-600" />
                <h3 className="font-black uppercase text-sm tracking-tighter">Client Information</h3>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <Label className="text-[10px] font-bold text-slate-400">Client Contact Person</Label>
                  <Input value={formData.client.name} onChange={(e) => setFormData({...formData, client: {...formData.client, name: e.target.value}})} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold">Client Email</Label>
                  <Input value={formData.client.email} onChange={(e) => setFormData({...formData, client: {...formData.client, email: e.target.value}})} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold">Client Phone</Label>
                  <Input value={formData.client.phone} onChange={(e) => setFormData({...formData, client: {...formData.client, phone: e.target.value}})} />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold">Website</Label>
                  <Input value={formData.client.website || ""} onChange={(e) => setFormData({...formData, client: {...formData.client, website: e.target.value}})} />
                </div>
                <div className="col-span-2 space-y-1">
                  <Label className="text-[10px] font-bold">Billing Address</Label>
                  <Input value={formData.client.address} onChange={(e) => setFormData({...formData, client: {...formData.client, address: e.target.value}})} />
                </div>
              </div>
            </div>
          </div>

          {/* MIDDLE SECTION: INVOICE DETAILS */}
          <div className="bg-slate-50 p-6 border-y-2 border-black flex flex-wrap gap-8 items-end">
            <div className="flex-1 min-w-[150px] space-y-1">
              <Label className="text-[10px] font-black uppercase">Invoice No.</Label>
              <Input className="font-mono font-bold text-blue-600" value={formData.invoiceNumber} onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})} />
            </div>
            <div className="flex-1 min-w-[150px] space-y-1">
              <Label className="text-[10px] font-black uppercase">Issue Date</Label>
              <Input type="date" value={new Date(formData.invoiceDate).toISOString().split('T')[0]} onChange={(e) => setFormData({...formData, invoiceDate: e.target.value})} />
            </div>
            <div className="flex-1 min-w-[150px] space-y-1 text-red-600">
              <Label className="text-[10px] font-black uppercase">Due Date</Label>
              <Input type="date" value={new Date(formData.dueDate).toISOString().split('T')[0]} onChange={(e) => setFormData({...formData, dueDate: e.target.value})} />
            </div>
            <div className="flex-1 min-w-[100px] space-y-1">
              <Label className="text-[10px] font-black uppercase">Currency</Label>
              <Input value={formData.currency} onChange={(e) => setFormData({...formData, currency: e.target.value})} />
            </div>

            {/* 🔄 MODIFIED: Category Input is now a Dropdown using DB data */}
            <div className="flex-1 min-w-[150px] space-y-1">
              <Label className="text-[10px] font-black uppercase">Category</Label>
              {mounted ? (
                <Select 
                  value={formData.category} 
                  onValueChange={(val) => setFormData({...formData, category: val})}
                >
                  <SelectTrigger className="bg-white border-slate-200">
                    <SelectValue placeholder="Select Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="h-10 w-full bg-slate-100 animate-pulse rounded" />
              )}
            </div>
          </div>

          {/* REST OF YOUR UI (Items Table, Summary, etc.) */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <h3 className="font-black uppercase text-xs tracking-widest flex items-center gap-2">
                <FileText size={16} /> Line Items List
              </h3>
              <Button onClick={addItem} size="sm" className="bg-blue-600 text-[10px] font-bold px-4 h-7 uppercase rounded-none tracking-widest">
                <Plus size={14} className="mr-1" /> Add New Row
              </Button>
            </div>
            <div className="space-y-2">
              {formData.items.map((item: any, index: number) => (
                <div key={index} className="flex gap-4 items-center bg-slate-50/50 p-2 border-b border-slate-100">
                  <div className="flex-[5]"><Input placeholder="Item Description" value={item.description} onChange={(e) => handleItemChange(index, 'description', e.target.value)} /></div>
                  <div className="w-24"><Input type="number" placeholder="Qty" value={item.quantity || ""} onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value))} /></div>
                  <div className="w-36"><Input type="number" placeholder="Rate" value={item.rate || ""} onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value))} /></div>
                  <div className="w-36 text-right font-black font-mono">Rs. {item.amount.toLocaleString()}</div>
                  <Button onClick={() => removeItem(index)} variant="ghost" size="icon" className="text-slate-300 hover:text-red-600"><Trash2 size={16} /></Button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 pt-6">
            <div className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">Note to Client</Label>
                <Textarea className="h-24 bg-slate-50" value={formData.note || ""} onChange={(e) => setFormData({...formData, note: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-black uppercase text-slate-500">Terms & Conditions</Label>
                <Textarea className="h-24 bg-slate-50" value={formData.terms || ""} onChange={(e) => setFormData({...formData, terms: e.target.value})} />
              </div>
            </div>

            <div className="bg-black text-white p-8 rounded-none border-l-8 border-blue-600 shadow-2xl space-y-6">
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-bold text-slate-500 uppercase">
                  <span>Subtotal</span>
                  <span>Rs. {formData.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                  <div className="flex items-center gap-1"><Percent size={12} className="text-blue-500" /> Tax Rate %</div>
                  <div className="w-32">
                    <Input className="h-7 bg-slate-900 border-slate-700 text-right text-xs" type="number" 
                      value={formData.taxRate || ""} 
                      onChange={(e) => {
                        const rate = parseFloat(e.target.value) || 0;
                        const { subtotal, taxAmount, total } = handleCalculation(formData.items, rate, formData.discountValue);
                        setFormData({...formData, taxRate: rate, subtotal, taxAmount, total});
                      }} 
                    />
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase">
                  <span>Discount (Rs.)</span>
                  <div className="w-32">
                    <Input className="h-7 bg-slate-900 border-slate-700 text-right text-xs" type="number" 
                      value={formData.discountValue || ""} 
                      onChange={(e) => {
                        const disc = parseFloat(e.target.value) || 0;
                        const { subtotal, taxAmount, total } = handleCalculation(formData.items, formData.taxRate, disc);
                        setFormData({...formData, discountValue: disc, subtotal, taxAmount, total});
                      }} 
                    />
                  </div>
                </div>
              </div>
              <div className="border-t border-slate-800 pt-6 flex justify-between items-end">
                <div className="flex flex-col">
                  <span className="text-blue-500 text-[10px] font-black uppercase tracking-[0.2em]">Total Due ({formData.currency})</span>
                  <span className="text-4xl font-black italic tracking-tighter">Rs. {formData.total.toLocaleString()}</span>
                </div>
                <CreditCard size={40} className="text-slate-800" />
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 bg-slate-100 border-t border-slate-200">
          <Button variant="ghost" onClick={onClose} className="font-bold hover:bg-white">CANCEL</Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 px-12 rounded-none font-black uppercase">
            <Save size={16} className="mr-2" /> Sync Data
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}