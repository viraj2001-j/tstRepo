"use client"

import React from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface NotesProps {
  notes: {
    note: string;
    terms: string;
  };
  update: (fields: Partial<NotesProps['notes']>) => void;
}

const NotesTermsCard = ({ notes, update }: NotesProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Notes & Terms</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Client Note</Label>
          <textarea
            className="w-full min-h-[100px] border rounded-md p-2 text-sm bg-background focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Thank you for your business! Please make payment within the due date."
            value={notes.note}
            onChange={(e) => update({ note: e.target.value })}
          />
        </div>
        
        <div className="space-y-2">
          <Label>Terms & Conditions</Label>
          <textarea
            className="w-full min-h-[100px] border rounded-md p-2 text-sm bg-background focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            placeholder="Payment due within 15 days. Late fees may apply."
            value={notes.terms}
            onChange={(e) => update({ terms: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  )
}

export default NotesTermsCard