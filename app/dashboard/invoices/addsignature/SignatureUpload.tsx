"use client"

import React, { useRef, useState, useEffect } from 'react'
import SignatureCanvas from 'react-signature-canvas'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { PenTool, Trash2, CheckCircle, Save } from "lucide-react"
import { updateAdminSignature } from "@/app/api/invoice/signature/addsignature/route"
import { toast } from "sonner"

interface Props {
  initialSignature?: string | null
}

export default function SignatureUpload({ initialSignature }: Props) {
  const sigCanvas = useRef<SignatureCanvas>(null)
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [savedSignature, setSavedSignature] = useState(initialSignature)

  useEffect(() => { setMounted(true) }, [])

  const handleSave = async () => {
    if (sigCanvas.current?.isEmpty()) {
toast.error("Signature Required", {
        description: "Please draw your signature in the pad before saving."
      })
      return
    }

    const base64 = sigCanvas.current?.getTrimmedCanvas().toDataURL('image/png') ?? ""
    setLoading(true)

toast.promise(updateAdminSignature(base64), {
      loading: 'Uploading signature to secure storage...',
      success: (res) => {
        if (res.success) {
          setSavedSignature(base64)
          sigCanvas.current?.clear()
          return "Signature saved and activated!"
        }
        throw new Error("Failed to save")
      },
      error: 'Could not update signature. Please try again.',
      finally: () => setLoading(false)
    })
  }

  if (!mounted) return null

  return (
    <div className="grid gap-6 md:grid-cols-2 w-full">
      {/* 1. CURRENT SAVED SIGNATURE */}
      <Card className="border-2 border-slate-100 shadow-sm">
        <CardHeader>
          <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Active Official Signature
          </CardTitle>
          <CardDescription>This appears on all generated invoices.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6">
          {savedSignature ? (
            <div className="rounded-lg border bg-white p-4 shadow-inner">
              <img src={savedSignature} alt="Admin Signature" className="max-h-32" />
            </div>
          ) : (
            <div className="flex h-32 w-full items-center justify-center rounded-lg border-2 border-dashed bg-slate-50 text-slate-400">
              No signature saved yet.
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. SIGNATURE PAD */}
      <Card className="border-2 border-blue-50 shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-600">
            <PenTool size={18} /> Update Signature
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="overflow-hidden rounded-xl border-2 border-slate-200 bg-white">
            <SignatureCanvas
              ref={sigCanvas}
              penColor="black"
              canvasProps={{ className: "sigCanvas w-full h-40 cursor-crosshair" }}
            />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading} className="flex-1 bg-blue-600 hover:bg-blue-700">
              <Save className="mr-2 h-4 w-4" /> 
              {loading ? "Saving..." : "Save New Signature"}
            </Button>
            <Button variant="outline" onClick={() => sigCanvas.current?.clear()} className="text-red-500 hover:bg-red-50">
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}