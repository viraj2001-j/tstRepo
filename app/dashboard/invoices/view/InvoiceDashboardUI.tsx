"use client"

import { useState } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  CheckCircle, Clock, Download, Edit, Trash2, 
  Building2, User, Package, RotateCcw, Share2,
  Copy
} from "lucide-react"

import { updateInvoiceStatus, deleteInvoice } from "@/app/api/invoice/view/route" 
import StatsSummary from "./StatsSummary"
import SearchFilters from "./SearchFilters"
import { useInvoiceFilter } from "./InvoiceFilterEngine"
import { generateInvoicePDF } from "@/lib/PDFgenerator";
import EditInvoicePopup from "./EditInvoicePopup";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { sendInvoiceEmail } from '@/app/api/invoice/sendemail/route'
import { toast } from 'sonner'

export default function InvoiceDashboardUI({ initialInvoices, userRole, stats }: any) {
  
  const { filteredData, setFilters } = useInvoiceFilter(initialInvoices);

  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const openEditModal = (invoice: any) => {
    setSelectedInvoice(invoice);
    setIsPopupOpen(true);
  };

  // Immediate save logic
const handleStatus = async (id: number, status: any) => {
    toast.promise(updateInvoiceStatus(id, status), {
      loading: `Updating status to ${status}...`,
      success: `Invoice marked as ${status}`,
      error: 'Failed to update status',
    });
  }

const handleDelete = async (id: number) => {
    if(confirm("Are you sure?")) {
        toast.promise(deleteInvoice(id), {
            loading: 'Deleting invoice...',
            success: 'Invoice removed',
            error: 'Could not delete invoice',
        });
    }
  };

const handleCopyLink = (invoiceId: number) => {
    // 🟢 Use the environment variable or fallback to localhost
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    
    // 🟢 The route must match your app/public/invoice/[id] folder structure
    const link = `${baseUrl}/public/invoice/${invoiceId}`;

    navigator.clipboard.writeText(link)
      .then(() => toast.success("Link copied to clipboard"))
      .catch(() => toast.error("Failed to copy link"));
  };

  // const handleShareInvoice = (invoiceId: number) => {
  //   const link = `https://yourapp.com/invoice/${invoiceId}`;
  //   if (navigator.share) {
  //     navigator.share({
  //       title: `Invoice #${invoiceId}`,
  //       url: link,
  //     }).catch((error) => alert("Error sharing the invoice"));
  //   } else {
  //     alert("Sharing not supported on this device");
  //   }
  // };

  return (
<div className="w-full space-y-8">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Invoice Dashboard</h1>
          <p className="text-slate-500 text-sm font-medium">Manage and monitor your business transactions</p>
        </div>
        <Button 
          onClick={() => window.location.href='/dashboard/invoices/new'}
          className="bg-blue-600 hover:bg-blue-700 font-bold px-6"
        >
          + Create New Invoice
        </Button>
      </div>

      <StatsSummary stats={stats} />
      
      <div className="bg-white p-2 rounded-xl border border-slate-200 shadow-sm">
        <SearchFilters onFilterChange={setFilters} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-bold text-slate-600 py-5">Invoice ID</TableHead>
              <TableHead className="font-bold text-slate-600">Client / Company</TableHead>
              <TableHead className="font-bold text-slate-600">Status</TableHead>
              <TableHead className="font-bold text-slate-600">Timeline</TableHead>
              <TableHead className="font-bold text-slate-600 text-right">Amount</TableHead>
              <TableHead className="font-bold text-slate-600 text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length > 0 ? (
              filteredData.map((inv: any) => (
                <TableRow key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                  
                  <TableCell className="font-mono font-bold text-blue-600">#{inv.invoiceNumber}</TableCell>

                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900">{inv.client.name}</span>
                      {inv.company && (
                        <span className="text-[11px] text-slate-500 flex items-center gap-1">
                          <Building2 size={12} /> {inv.company.name}
                        </span>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge className={ 
                      inv.status === 'PAID' ? 'bg-green-100 text-green-700 hover:bg-green-100' : 
                      inv.status === 'OVERDUE' ? 'bg-red-100 text-red-700 hover:bg-red-100' : 
                      'bg-yellow-100 text-yellow-700 hover:bg-yellow-100'
                    }>
                      {inv.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    <div className="text-[12px] flex flex-col">
                      <span className="text-slate-500">Created: {new Date(inv.createdAt).toLocaleDateString()}</span>
                      <span className="text-red-500 font-medium">Due: {new Date(inv.dueDate).toLocaleDateString()}</span>
                    </div>
                  </TableCell>

{/* 🟢 FIXED: Amount cell now uses dynamic currency (LKR or USD) */}
                  <TableCell className="text-right font-black text-slate-900">
                    <span className="text-[10px] text-slate-400 mr-1">{inv.currency}</span>
                    {inv.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center justify-center gap-1">
                      
                      {/* Share Button */}
                    <Button 
  title="Email to Client" 
  variant="ghost" 
  size="icon" 
  className="h-8 w-8 text-orange-600 hover:bg-orange-50"
  onClick={async () => {
    const ok = confirm("Are you sure you want to send this to the client's email?");
    if (ok) {
      const res = await sendInvoiceEmail(inv.id);
      if (res.success) alert("Email sent successfully!");
      else alert("Error: " + res.error);
    }
  }}
>
  <Package size={16}/>
</Button>

                      {/* Copy Link Button */}
<Button 
  title="Copy Public Link" 
  variant="ghost" 
  size="icon" 
  className="h-8 w-8 text-blue-600 hover:bg-blue-50"
  onClick={() => handleCopyLink(inv.id)}
>
  <Share2 size={16} /> {/* Share icon often looks cleaner for external links */}
</Button>

                      {/* Other Action Buttons */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button title="Change Status" variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50">
                            <RotateCcw size={16} />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 font-bold">
                          <DropdownMenuLabel className="text-[10px] uppercase text-slate-400">Mark As...</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleStatus(inv.id, "PAID")} className="text-green-600 cursor-pointer">PAID</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatus(inv.id, "SENT")} className="text-blue-600 cursor-pointer">SENT</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatus(inv.id, "DRAFT")} className="text-yellow-600 cursor-pointer">DRAFT</DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStatus(inv.id, "OVERDUE")} className="text-red-600 cursor-pointer">OVERDUE</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>

                      <Button title="PDF" variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:bg-blue-50" onClick={() => generateInvoicePDF(inv)}>
                        <Download size={16}/>
                      </Button>

                      <Button 
                        title="Edit" 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-slate-500 hover:bg-slate-100"
                        onClick={() => openEditModal(inv)}
                      >
                        <Edit size={16}/>
                      </Button>
                      
                      {userRole === "SUPERADMIN" ? (
                        <Button title="Delete" onClick={() => handleDelete(inv.id)} variant="ghost" size="icon" className="h-8 w-8 text-red-600 hover:bg-red-50">
                          <Trash2 size={16}/>
                        </Button>
                      ) : (
                        <div className="w-8 flex justify-center opacity-10"><Trash2 size={16}/></div>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-400 italic">No invoices found matching your filters...</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <EditInvoicePopup 
        invoice={selectedInvoice} 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
      />
    </div>
  )
}
