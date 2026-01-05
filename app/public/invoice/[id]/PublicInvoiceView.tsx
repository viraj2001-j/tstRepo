"use client"

import React, { useRef, useState, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, CheckCircle2, PenTool, Badge } from "lucide-react"
import { generateInvoicePDF } from "@/lib/PDFgenerator"
import { submitSignature } from "@/app/api/invoice/signature/route"

export default function PublicInvoiceView({ invoice }: any) {
  const sigCanvas = useRef<SignatureCanvas>(null);
  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const handleSign = async () => {
    if (sigCanvas.current?.isEmpty()) {
      alert("Please draw your signature first.");
      return;
    }

    const base64 = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png') ?? "";
    setLoading(true);

    const res = await submitSignature(invoice.id, base64);
    if (res.success) {
      alert("Invoice Signed!");
      window.location.reload(); 
    } else {
      alert("Error saving signature.");
    }
    setLoading(false);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* TOP BAR */}
        <div className="flex justify-between items-center bg-white p-6 rounded-xl border shadow-sm">
          <div>
            <h1 className="text-xl font-black uppercase italic">Invoice <span className="text-blue-600">#</span>{invoice.invoiceNumber}</h1>
            <Badge className={invoice.isSigned ? "bg-green-500" : "bg-blue-500"}>
              {invoice.isSigned ? "SIGNED & ACCEPTED" : "AWAITING SIGNATURE"}
            </Badge>
          </div>

<Button 
  onClick={() => generateInvoicePDF(invoice, true)} // 🟢 Pass 'true' here
  variant="outline" 
  className="font-bold"
>
  <Download className="mr-2" size={16} /> DOWNLOAD PDF
</Button>
        </div>

        {/* INVOICE BODY */}
        <Card className="border-none shadow-2xl overflow-hidden bg-white">
          <CardContent className="p-12 space-y-10">
            <div className="flex justify-between border-b pb-10">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase">Billing From</p>
                <p className="font-black text-lg">{invoice.company?.name}</p>
                <p className="text-sm text-slate-500">{invoice.company?.email}</p>
              </div>
              <div className="text-right space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase">Total Due</p>
                <p className="text-3xl font-black text-blue-600">{invoice.currency} {invoice.total.toLocaleString()}</p>
              </div>
            </div>

            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-black uppercase text-slate-400 border-b">
                  <th className="text-left pb-4">Service Description</th>
                  <th className="text-right pb-4">Rate</th>
                  <th className="text-right pb-4">Qty</th>
                  <th className="text-right pb-4">Line Total</th>
                </tr>
              </thead>
              <tbody>
                {invoice.items.map((item: any) => (
                  <tr key={item.id} className="border-b last:border-0">
                    <td className="py-6 font-bold text-slate-800">{item.description}</td>
                    <td className="py-6 text-right font-mono">{item.rate.toLocaleString()}</td>
                    <td className="py-6 text-right font-mono">{item.quantity}</td>
                    <td className="py-6 text-right font-black">{(item.quantity * item.rate).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 🟢 ADMIN SIGNATURE DISPLAY SECTION */}
            <div className="pt-10 border-t flex justify-between items-end">
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase">Authorized Signature</p>
                {invoice.adminSignature ? (
                  <div className="border-b-2 border-slate-200 pb-2">
                    <img 
                      src={invoice.adminSignature} 
                      alt="Admin Signature" 
                      className="h-16 object-contain mix-blend-multiply" 
                    />
                    <p className="text-xs font-bold text-slate-800 mt-2 italic">Issued by Super Admin</p>
                  </div>
                ) : (
                  <div className="h-16 flex items-center italic text-slate-300 text-xs">
                    No admin signature attached
                  </div>
                )}
              </div>
              

            </div>
          </CardContent>
        </Card>

        {/* CLIENT SIGNATURE AREA (No changes here) */}
        <Card className={`border-2 transition-all ${invoice.isSigned ? 'border-green-500 bg-green-50/30' : 'border-blue-600 shadow-2xl bg-white'}`}>
          <CardContent className="p-10">
            <div className="flex items-center gap-3 mb-8">
              {invoice.isSigned ? <CheckCircle2 className="text-green-600" /> : <PenTool className="text-blue-600" />}
              <h2 className="text-lg font-black uppercase italic tracking-tighter">
                {invoice.isSigned ? "Electronic Signature Recorded" : "Digital Acceptance Required"}
              </h2>
            </div>

            {invoice.isSigned ? (
              <div className="space-y-4">
                <div className="bg-white p-4 border-2 border-slate-100 rounded-xl inline-block shadow-inner">
                  <img src={invoice.signature ?? ""} alt="Signature" className="h-24 grayscale" />
                </div>
                <p className="text-xs text-slate-500 font-medium">
                  Digitally signed by <span className="text-black font-bold">{invoice.client.name}</span> on {new Date(invoice.signedAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-slate-500 leading-relaxed">
                  By signing in the box below, you acknowledge that you have reviewed the charges and agree to the terms of service provided.
                </p>
                <div className="border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 overflow-hidden">
                  <SignatureCanvas 
                    ref={sigCanvas}
                    penColor='black'
                    canvasProps={{ className: "w-full h-48 cursor-crosshair" }}
                  />
                </div>
                <div className="flex gap-4">
                  <Button onClick={handleSign} disabled={loading} className="bg-blue-600 hover:bg-blue-700 px-10 h-12 font-black uppercase rounded-none tracking-widest">
                    {loading ? "PROCESSING..." : "CONFIRM & SIGN"}
                  </Button>
                  <Button variant="ghost" onClick={() => sigCanvas.current?.clear()} className="h-12 font-bold text-slate-400">
                    CLEAR PAD
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}