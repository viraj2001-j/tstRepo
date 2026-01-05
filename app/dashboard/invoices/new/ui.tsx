"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { User, ShieldCheck, Loader2, Save, X, RotateCcw, Beaker } from "lucide-react"
import { useRouter } from "next/navigation"

// Component Imports
import Sidebar from "@/components/sidebar" // Adjust path to your Sidebar file
import ClientInformationCard from "./components/ClientInformationCard"
import Company from "./components/Company"
import InvoiceDetailsCard from "./components/InvoiceDetailsCard"
import InvoiceItemsCard from "./components/InvoiceItemsCard"
import SummaryCard from "./components/SummaryCard"
import NotesTermsCard from "./components/NotesTermsCard"

// Master Action
import { createFullInvoice } from "@/app/api/invoice/route"

import { toast } from "sonner"

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

// 🟢 1. Define Initial State for Resetting
const initialState = {
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
};

export default function CreateInvoiceUI({ user }: CreateInvoiceUIProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [invoiceData, setInvoiceData] = useState(initialState)

  // const [invoiceData, setInvoiceData] = useState({
  //   company: { name: "", project: "", phone: "", email: "", address: "" },
  //   client: { name: "", email: "", phone: "", website: "", address: "" },
  //   details: { 
  //     invoiceNumber: `INV-${Date.now().toString().slice(-6)}`, 
  //     invoiceDate: new Date().toISOString().split('T')[0], 
  //     dueDate: "", 
  //     currency: "LKR", 
  //     category: "" 
  //   },
  //   items: [{ description: "", qty: 1, rate: 0 }] as Item[],
  //   summary: { subtotal: 0, taxRate: 0, taxAmount: 0, discountType: "Amount", discountValue: 0, total: 0 },
  //   notes: { note: "", terms: "" }
  // })

  // 🟢 2. Fill Sample Data Function
  const fillSampleData = () => {
    setInvoiceData({
      ...initialState,
      company: { 
        name: "Lucifer Digital Ltd", 
        project: "Web Development", 
        phone: "+94 77 123 4567", 
        email: "hello@lucifer.com", 
        address: "123 Tech Park, Colombo 03" 
      },
      client: { 
        name: "John Doe", 
        email: "john@example.com", 
        phone: "+94 71 999 8888", 
        website: "www.client.com", 
        address: "45 Ocean Drive, Galle" 
      },
      details: {
        ...initialState.details,
        category: "Software Development",
        currency: "LKR"
      },
      items: [
        { description: "UI/UX Design Phase", qty: 1, rate: 25000 },
        { description: "Frontend Development", qty: 2, rate: 50000 }
      ],
      notes: { 
        note: "Thank you for your business!", 
        terms: "Payment due within 15 days of issue." 
      }
    });
    toast.info("Sample data loaded into form.");
  };

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
   if (!invoiceData.client.name) {
      return toast.error("Client Name Required", {
        description: "Please enter a client name before saving.",
      })
    }
    setLoading(true)
    const result = await createFullInvoice(invoiceData)
    setLoading(false)

    if (result.success) {
      toast.success("Invoice Saved Successfully!"); 
      setInvoiceData({
        ...initialState,
        details: { 
          ...initialState.details, 
          invoiceNumber: `INV-${Date.now().toString().slice(-6)}` 
        }
      });
      router.push("/dashboard/invoices/new")
    } else {
      toast.error("Save Failed", {
        description: result.error,
      })
    }
  }

  return (
    <>
    
   <div className="space-y-6 w-full py-8 px-1 md:px-1 lg:px-1">
      {/* SIDEBAR NAVIGATION */}


      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto pt-16 md:pt-0 scroll-smooth">
<div className="space-y-6 w-full mx-auto py-8 px-4 md:px-12">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-xl shadow-sm border border-slate-200 gap-4">
            <div className="flex flex-col">
              <h2 className="font-bold text-2xl text-slate-800 tracking-tight">Create New Invoice</h2>
              <div className="flex items-center gap-3 mt-2 text-xs">
                <div className="flex items-center text-slate-500 gap-1 bg-slate-100 px-2 py-1 rounded">
                  <User size={14} />
                  <span className="font-medium">{user.username}</span>
                </div>
                <div className="flex items-center gap-1 bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                  <ShieldCheck size={14} />
                  <span className="font-bold uppercase tracking-wider">{user.role}</span>
                </div>
              </div>
            </div>
            <Button variant="outline" onClick={() => window.location.reload()} className="hover:bg-slate-50 transition-colors">
              <RotateCcw size={16} className="mr-2"/>Reset Form
            </Button>

            {/* 🟢 Sample Data Button */}
          <Button variant="secondary" onClick={fillSampleData} className="flex-1 md:flex-none">
            <Beaker size={16} className="mr-2"/> Sample Data
          </Button>
          
          </div>

          

          {/* FORM CARDS */}
          <div className="grid gap-6">
            <Company data={invoiceData.company} update={(f) => setInvoiceData({...invoiceData, company: {...invoiceData.company, ...f}})} />
            <ClientInformationCard data={invoiceData.client} update={(f) => setInvoiceData({...invoiceData, client: {...invoiceData.client, ...f}})} />
            <InvoiceDetailsCard data={invoiceData.details} update={(f) => setInvoiceData({...invoiceData, details: {...invoiceData.details, ...f}})} />
            <InvoiceItemsCard items={invoiceData.items} update={(ni) => setInvoiceData({...invoiceData, items: ni})} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
<SummaryCard 
  currency={invoiceData.details.currency} // 🟢 Pass currency from Details
  summary={invoiceData.summary} 
  update={(f) => setInvoiceData({...invoiceData, summary: {...invoiceData.summary, ...f}})} 
/>
              <NotesTermsCard notes={invoiceData.notes} update={(f) => setInvoiceData({...invoiceData, notes: {...invoiceData.notes, ...f}})} />
            </div>
          </div>

          {/* ACTIONS FOOTER */}
          <div className="flex justify-end gap-3 bg-white/80 backdrop-blur-md p-4 rounded-xl shadow-lg border border-slate-200 sticky bottom-6 z-20">
            <Button variant="ghost" onClick={() => router.push("/dashboard/invoices/new")}>
              <X size={18} className="mr-2"/> Cancel
            </Button>
            <Button onClick={handleSaveInvoice} disabled={loading} className="px-10 bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-200 transition-all">
              {loading ? <Loader2 className="animate-spin mr-2" /> : <Save size={18} className="mr-2"/>}
              Save Invoice
            </Button>
          </div>
        </div>
      </main>
    </div>
    </>
  )
}