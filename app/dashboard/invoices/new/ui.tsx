"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { User, ShieldCheck, Loader2, Save, X, RotateCcw } from "lucide-react"
import { useRouter } from "next/navigation"

// Card Imports
import ClientInformationCard from "./components/ClientInformationCard"
import Company from "./components/Company"
import InvoiceDetailsCard from "./components/InvoiceDetailsCard"
import InvoiceItemsCard from "./components/InvoiceItemsCard"
import SummaryCard from "./components/SummaryCard"
import NotesTermsCard from "./components/NotesTermsCard"

// Master Action
import { createFullInvoice } from "@/app/api/invoice/route"

interface Item {
  description: string;
  qty: number;
  rate: number;
}

interface CreateInvoiceUIProps {
  user: {
    username: string
    role: string
    id: string
  }
}

export default function CreateInvoiceUI({ user }: CreateInvoiceUIProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const [invoiceData, setInvoiceData] = useState({
    company: { name: "", project: "", phone: "", email: "", address: "" },
    client: { name: "", email: "", phone: "", website: "", address: "" },
    details: { 
      invoiceNumber: `INV-${Date.now().toString().slice(-6)}`, 
      invoiceDate: new Date().toISOString().split('T')[0], 
      dueDate: "", 
      currency: "LKR", 
      category: "" 
    },
    items: [{ description: "", qty: 1, rate: 0 }] as Item[],
    summary: { subtotal: 0, taxRate: 0, taxAmount: 0, discountType: "Amount", discountValue: 0, total: 0 },
    notes: { note: "", terms: "" }
  })

  // Calculation Logic
  useEffect(() => {
    const subtotal = invoiceData.items.reduce((sum, i) => sum + (i.qty * i.rate), 0)
    const taxAmount = subtotal * (invoiceData.summary.taxRate / 100)
    let discount = invoiceData.summary.discountValue
    if (invoiceData.summary.discountType === "Percentage") discount = subtotal * (discount / 100)
    const total = subtotal + taxAmount - discount

    setInvoiceData(prev => ({
      ...prev, 
      summary: { ...prev.summary, subtotal, taxAmount, total }
    }))
  }, [invoiceData.items, invoiceData.summary.taxRate, invoiceData.summary.discountType, invoiceData.summary.discountValue])

  const handleSaveInvoice = async () => {
    if (!invoiceData.client.name) return alert("Client Name is required")
    
    setLoading(true)
    const result = await createFullInvoice(invoiceData)
    setLoading(false)

    if (result.success) {
      alert("Invoice saved successfully!")
      router.push("/dashboard/invoices/new") // Redirect to list
    } else {
      alert(result.error)
    }
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 px-4">
      {/* HEADER */}
      <div className="flex justify-between items-center bg-white p-4 rounded shadow border">
        <div className="flex flex-col">
          <h2 className="font-bold text-xl text-slate-800">Create New Invoice</h2>
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
        <Button variant="outline" onClick={() => window.location.reload()}><RotateCcw size={16} className="mr-2"/>Reset Form</Button>
      </div>

      {/* FORM CARDS */}
      <Company data={invoiceData.company} update={(f) => setInvoiceData({...invoiceData, company: {...invoiceData.company, ...f}})} />
      <ClientInformationCard data={invoiceData.client} update={(f) => setInvoiceData({...invoiceData, client: {...invoiceData.client, ...f}})} />
      <InvoiceDetailsCard data={invoiceData.details} update={(f) => setInvoiceData({...invoiceData, details: {...invoiceData.details, ...f}})} />
      <InvoiceItemsCard items={invoiceData.items} update={(ni) => setInvoiceData({...invoiceData, items: ni})} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SummaryCard summary={invoiceData.summary} update={(f) => setInvoiceData({...invoiceData, summary: {...invoiceData.summary, ...f}})} />
        <NotesTermsCard notes={invoiceData.notes} update={(f) => setInvoiceData({...invoiceData, notes: {...invoiceData.notes, ...f}})} />
      </div>

      {/* FOOTER */}
      <div className="flex justify-end gap-3 bg-white p-4 rounded shadow border sticky bottom-4 z-10">
        <Button variant="ghost" onClick={() => router.push("/dashboard/invoices/new")}><X size={18} className="mr-2"/> Cancel</Button>
        <Button onClick={handleSaveInvoice} disabled={loading} className="px-8">
          {loading ? <Loader2 className="animate-spin mr-2" /> : <Save size={18} className="mr-2"/>}
          Save Invoice
        </Button>
      </div>
    </div>
  )
}