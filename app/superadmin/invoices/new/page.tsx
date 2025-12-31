"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { User, ShieldCheck, Loader2, Save, X, RotateCcw } from "lucide-react"

// Import your sub-components
import ClientInformationCard from "./components/ClientInformationCard"
import Company from "./components/Company"
import InvoiceDetailsCard from "./components/InvoiceDetailsCard"
import InvoiceItemsCard from "./components/InvoiceItemsCard"
import SummaryCard from "./components/SummaryCard"
import NotesTermsCard from "./components/NotesTermsCard"

// Import the Master Server Action
import { createFullInvoice } from "@/app/api/invoice/route"

// 🛡️ Interfaces
interface Item {
  description: string;
  qty: number;
  rate: number;
}

interface CreateInvoiceClientProps {
  user?: { // Made optional with '?' to prevent crashes
    username: string
    role: string
    id: string
  }
}

export default function CreateInvoiceClient({ user }: CreateInvoiceClientProps) {
  const [loading, setLoading] = useState(false)

  // 🧠 THE BRAIN: Centralized state for all cards
  const [invoiceData, setInvoiceData] = useState({
    company: { name: "", project: "", phone: "", email: "", address: "" },
    client: { name: "", email: "", phone: "", website: "", address: "" },
    details: { 
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`, // Auto-generate placeholder
      invoiceDate: new Date().toISOString().split('T')[0], 
      dueDate: "", 
      currency: "LKR", 
      category: "" 
    },
    items: [{ description: "", qty: 1, rate: 0 }] as Item[],
    summary: { subtotal: 0, taxRate: 0, taxAmount: 0, discountType: "Amount", discountValue: 0, total: 0 },
    notes: { note: "", terms: "" }
  })

  // 🧮 AUTO-CALCULATION LOGIC
  useEffect(() => {
    const subtotal = invoiceData.items.reduce((sum, i) => sum + (i.qty * i.rate), 0)
    const taxAmount = subtotal * (invoiceData.summary.taxRate / 100)
    
    let discount = invoiceData.summary.discountValue
    if (invoiceData.summary.discountType === "Percentage") {
      discount = subtotal * (discount / 100)
    }

    const total = subtotal + taxAmount - discount
    setInvoiceData(prev => ({
      ...prev, 
      summary: { ...prev.summary, subtotal, taxAmount, total }
    }))
  }, [invoiceData.items, invoiceData.summary.taxRate, invoiceData.summary.discountType, invoiceData.summary.discountValue])

  // 🚀 MASTER SAVE FUNCTION
  const handleSaveInvoice = async () => {
    // Basic Validation
    if (!invoiceData.client.name || !invoiceData.details.invoiceNumber) {
      alert("Please enter at least the Client Name and Invoice Number.")
      return
    }

    setLoading(true)
    const result = await createFullInvoice(invoiceData)
    setLoading(false)

    if (result.success) {
      alert("Invoice, Client, and Company saved successfully!")
      // Optional: window.location.href = "/superadmin/invoices"
    } else {
      alert(result.error || "An error occurred")
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 px-4">
      {/* NAVBAR WITH SESSION DATA (Safely handled with optional chaining) */}
      <div className="flex justify-between items-center bg-white p-4 rounded shadow border border-slate-200">
        <div className="flex flex-col">
          <h2 className="font-bold text-xl text-slate-800">Create New Invoice</h2>
          <div className="flex items-center gap-3 mt-1 text-xs">
            <div className="flex items-center text-muted-foreground gap-1">
              <User size={12} />
              <span>{user?.username || "Admin User"} (ID: {user?.id || "N/A"})</span>
            </div>
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
              <ShieldCheck size={12} />
              <span className="font-bold uppercase tracking-tighter">{user?.role || "SUPERADMIN"}</span>
            </div>
          </div>
        </div>
        <Button variant="outline" className="gap-2">
          <RotateCcw size={16} />
          Fill Sample
        </Button>
      </div>

      {/* FORM SECTIONS */}
      <div className="grid grid-cols-1 gap-6">
        <Company 
          data={invoiceData.company} 
          update={(fields) => setInvoiceData({ ...invoiceData, company: { ...invoiceData.company, ...fields } })} 
        />

        <ClientInformationCard 
          data={invoiceData.client} 
          update={(fields) => setInvoiceData({ ...invoiceData, client: { ...invoiceData.client, ...fields } })} 
        />

        <InvoiceDetailsCard 
          data={invoiceData.details} 
          update={(fields) => setInvoiceData({ ...invoiceData, details: { ...invoiceData.details, ...fields } })} 
        />

        <InvoiceItemsCard 
          items={invoiceData.items} 
          update={(newItems) => setInvoiceData({ ...invoiceData, items: newItems })} 
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SummaryCard 
            summary={invoiceData.summary} 
            update={(fields) => setInvoiceData({ ...invoiceData, summary: { ...invoiceData.summary, ...fields } })} 
          />

          <NotesTermsCard 
            notes={invoiceData.notes} 
            update={(fields) => setInvoiceData({ ...invoiceData, notes: { ...invoiceData.notes, ...fields } })} 
          />
        </div>
      </div>

      {/* FIXED ACTION FOOTER */}
      <div className="flex justify-end gap-3 bg-white p-4 rounded shadow border border-slate-200 sticky bottom-4 z-10">
        <Button variant="ghost" className="gap-2" disabled={loading}>
          <X size={18} /> Cancel
        </Button>
        <Button variant="secondary" disabled={loading}>
          Save as Draft
        </Button>
        <Button onClick={handleSaveInvoice} disabled={loading} className="gap-2 px-8">
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save size={18} />
          )}
          Save Invoice
        </Button>
      </div>
    </div>
  )
}