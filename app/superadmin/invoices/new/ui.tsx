"use client"

import React, { useState, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { User, ShieldCheck, Loader2 } from "lucide-react"

import ClientInformationCard from "./components/ClientInformationCard"
import Company from "./components/Company"
import InvoiceDetailsCard from "./components/InvoiceDetailsCard"
import InvoiceItemsCard from "./components/InvoiceItemsCard"
import SummaryCard from "./components/SummaryCard"
import NotesTermsCard from "./components/NotesTermsCard"
import { createFullInvoice } from "@/app/api/invoice/route"

// 🛡️ 1. Define the Item interface so TypeScript knows what it is
interface Item {
  description: string;
  qty: number;
  rate: number;
}

interface CreateInvoiceClientProps {
  user: {
    username: string
    role: string
    id: string
  }
}

export default function CreateInvoiceClient({ user }: CreateInvoiceClientProps) {
  const [loading, setLoading] = useState(false)

  // 🧠 2. Centralized State for all cards
  const [invoiceData, setInvoiceData] = useState({
    company: { name: "", project: "", phone: "", email: "", address: "" },
    client: { name: "", email: "", phone: "", website: "", address: "" },
    details: { invoiceNumber: "", invoiceDate: "", dueDate: "", currency: "LKR", category: "" },
    items: [{ description: "", qty: 1, rate: 0 }] as Item[],
    summary: { subtotal: 0, taxRate: 0, taxAmount: 0, discountType: "Amount", discountValue: 0, total: 0 },
    notes: { note: "", terms: "" }
  })

  // 🧮 3. Auto-Calculation Logic
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

  // 🚀 4. Final Save Function
  const handleSaveInvoice = async () => {
    setLoading(true)
    const result = await createFullInvoice(invoiceData)
    setLoading(false)

    if (result.success) {
      alert("Invoice saved successfully!")
      // Optional: reset state or redirect
    } else {
      alert(result.error || "An error occurred while saving.")
    }
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      {/* NAVBAR */}
      <div className="flex justify-between items-center bg-white p-4 rounded shadow border">
        <div className="flex flex-col">
          <h2 className="font-semibold text-lg">Create New Invoice</h2>
          <div className="flex items-center gap-3 mt-1 text-xs">
            <div className="flex items-center text-muted-foreground gap-1">
              <User size={12} />
              <span>{user.username} (ID: {user.id})</span>
            </div>
            <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
              <ShieldCheck size={12} />
              <span className="font-bold uppercase tracking-tighter">{user.role}</span>
            </div>
          </div>
        </div>
        <Button variant="outline">Fill Sample</Button>
      </div>

      {/* FORM SECTIONS - Now correctly wired to State */}
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

      {/* ACTIONS */}
      <div className="flex justify-end gap-3 p-4 bg-white rounded border shadow-sm">
        <Button variant="outline" disabled={loading}>Cancel</Button>
        <Button variant="secondary" disabled={loading}>Save as Draft</Button>
        <Button onClick={handleSaveInvoice} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save Invoice
        </Button>
      </div>
    </div>
  )
}