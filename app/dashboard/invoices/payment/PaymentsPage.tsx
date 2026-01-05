"use client"

import React, { useState, useMemo, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "sonner"
import { Search, CheckCircle2, Trash2, Edit3, Mail, Landmark, Download } from "lucide-react"

import { shareReceipt, shareStatement } from "@/lib/receiptGenerator";
import { recordPaymentAction, deletePaymentAction, updatePaymentAction } from "@/app/api/invoice/payment/route"
import Sidebar from '@/components/sidebar'

export default function PaymentsPage({ invoices = [] }: { invoices: any[] }) {
  const [mounted, setMounted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("");
  const [payAmount, setPayAmount] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<any>(null);

  useEffect(() => { setMounted(true); }, []);

  const selectedInvoice = useMemo(() => 
    invoices.find((inv: any) => inv.id.toString() === selectedInvoiceId),
  [selectedInvoiceId, invoices]);

  const globalStats = useMemo(() => {
    const total = invoices.reduce((acc, inv) => acc + (inv.total || 0), 0);
    const paid = invoices.reduce((acc, inv) => acc + (inv.amountPaid || 0), 0);
    return { total, paid, due: total - paid };
  }, [invoices]);

  const filteredInvoices = useMemo(() => invoices.filter((inv: any) => 
    inv.client.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    inv.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ), [searchTerm, invoices]);

  const handleDeletePayment = async (id: number) => {
    if (!confirm("Are you sure you want to delete this payment?")) return;
    setLoading(true);
    const res: any = await deletePaymentAction(id);
    if (res.success) toast.success("Payment deleted");
    setLoading(false);
  };

  const handleBulkDelete = async () => {
    if (!selectedInvoice?.payments.length) return;
    if (!confirm(`CRITICAL: Delete ALL payments for ${selectedInvoice.client.name}?`)) return;
    setLoading(true);
    try {
      for (const p of selectedInvoice.payments) { await deletePaymentAction(p.id); }
      toast.success("All payments cleared");
    } catch (err) { toast.error("Bulk delete failed"); }
    setLoading(false);
  };

  const handleUpdatePayment = async () => {
    if (!editingPayment) return;
    setLoading(true);
    const res: any = await updatePaymentAction({
      paymentId: editingPayment.id,
      amount: editingPayment.amount,
      method: editingPayment.method,
      paymentDate: editingPayment.paymentDate
    });
    if (res.success) { toast.success("Updated"); setEditModalOpen(false); }
    setLoading(false);
  };

  if (!mounted) return null;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />

      <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
        <div className="p-8 space-y-8">
          
          {/* STATS CARDS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-slate-900 text-white border-none shadow-md">
              <CardContent className="p-4">
                <p className="text-[10px] uppercase opacity-50 font-bold">Total Revenue</p>
                <p className="text-xl font-black italic">LKR {globalStats.total.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-green-600 text-white border-none shadow-md">
              <CardContent className="p-4">
                <p className="text-[10px] uppercase opacity-50 font-bold">Collected</p>
                <p className="text-xl font-black italic">LKR {globalStats.paid.toLocaleString()}</p>
              </CardContent>
            </Card>
            <Card className="bg-red-500 text-white border-none shadow-md">
              <CardContent className="p-4">
                <p className="text-[10px] uppercase opacity-50 font-bold">Owed</p>
                <p className="text-xl font-black italic">LKR {globalStats.due.toLocaleString()}</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            <div className="xl:col-span-4">
              <Card className="p-6 space-y-4 shadow-xl border-none bg-white font-bold">
                <Label className="text-xs uppercase text-slate-500 tracking-widest">Entry Panel</Label>
                <Input placeholder="Search Client..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                <Select onValueChange={setSelectedInvoiceId} value={selectedInvoiceId}>
                  <SelectTrigger className="font-bold"><SelectValue placeholder="Select Account" /></SelectTrigger>
                  <SelectContent>{filteredInvoices.map(inv => <SelectItem key={inv.id} value={inv.id.toString()}>{inv.client.name}</SelectItem>)}</SelectContent>
                </Select>
                {selectedInvoice && (selectedInvoice.total - selectedInvoice.amountPaid) <= 0 ? (
                   <div className="p-4 text-center bg-green-50 rounded-lg border border-green-200">
                      <CheckCircle2 size={24} className="mx-auto text-green-600 mb-1" />
                      <p className="text-[10px] font-black uppercase text-green-800">Settled</p>
                   </div>
                ) : (
                  <>
                    <Input type="number" placeholder="LKR Amount" className="h-12 text-lg font-bold" value={payAmount || ""} onChange={e => setPayAmount(Number(e.target.value))} />
                    <Button className="w-full bg-slate-900 h-12" onClick={() => recordPaymentAction({ invoiceId: Number(selectedInvoiceId), amount: payAmount, method: 'Cash', paymentDate: new Date().toISOString() })}>Submit Payment</Button>
                  </>
                )}
              </Card>
            </div>

            <div className="xl:col-span-8 space-y-4">
              {selectedInvoice && (
                <>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-slate-100 text-center">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Billed</p>
                      <p className="text-sm font-black italic">LKR {selectedInvoice.total.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 text-center">
                      <p className="text-[9px] font-bold text-slate-400 uppercase">Paid</p>
                      <p className="text-sm font-black text-green-600 italic">LKR {selectedInvoice.amountPaid.toLocaleString()}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-100 text-center">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Remaining</p>
                      <p className="text-sm font-black text-red-600 italic">LKR {(selectedInvoice.total - selectedInvoice.amountPaid).toLocaleString()}</p>
                    </div>
                  </div>

                  <Card className="shadow-xl border-none bg-white overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between py-4 px-6 bg-slate-50 border-b">
                      <CardTitle className="text-xs font-black uppercase text-slate-500 italic tracking-widest">History Ledger</CardTitle>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="gap-2 h-8 font-bold" onClick={() => shareStatement(selectedInvoice, true)}>
                          <Download size={14}/> Download
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2 h-8 font-bold" onClick={() => shareStatement(selectedInvoice, false)}>
                          <Mail size={14}/> Share All
                        </Button>
                        <Button variant="destructive" size="sm" className="gap-2 h-8 font-bold shadow-sm" onClick={handleBulkDelete}>
                          <Trash2 size={14}/> Delete All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="p-0">
                      {selectedInvoice.payments.map((p: any) => (
                        <div key={p.id} className="p-4 flex justify-between items-center border-b last:border-0 group hover:bg-slate-50">
                          <div className="flex items-center gap-4">
                            <Landmark size={18} className="text-slate-300"/>
                            <div>
                              <p className="font-black text-xs uppercase italic">Payment Received</p>
                              <p className="text-[10px] text-slate-400">{new Date(p.paymentDate).toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <span className="font-black text-green-600 text-sm">+{p.amount.toLocaleString()}</span>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100">
                              <Button variant="ghost" size="icon" onClick={() => shareReceipt(p, selectedInvoice, true)}><Download size={14}/></Button>
                              <Button variant="ghost" size="icon" className="text-blue-500" onClick={() => shareReceipt(p, selectedInvoice, false)}><Mail size={14}/></Button>
                              <Button variant="ghost" size="icon" onClick={() => { setEditingPayment(p); setEditModalOpen(true); }}><Edit3 size={14}/></Button>
                              <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleDeletePayment(p.id)}><Trash2 size={14}/></Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* EDIT MODAL */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="bg-white">
          <DialogHeader><DialogTitle className="text-xs font-black uppercase">Edit Entry</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <Input type="number" value={editingPayment?.amount || 0} onChange={e => setEditingPayment({...editingPayment, amount: Number(e.target.value)})} />
            <Input type="datetime-local" value={editingPayment?.paymentDate ? new Date(editingPayment.paymentDate).toISOString().slice(0, 16) : ''} onChange={e => setEditingPayment({...editingPayment, paymentDate: new Date(e.target.value).toISOString()})} />
          </div>
          <DialogFooter>
            <Button onClick={handleUpdatePayment} disabled={loading} className="bg-slate-900 w-full font-bold">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}