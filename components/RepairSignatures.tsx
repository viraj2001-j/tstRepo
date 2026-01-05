"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCcw } from "lucide-react"
import { syncExistingInvoices } from "@/app/api/test/route"

export default function RepairSignatures() {
  const [loading, setLoading] = useState(false);

  const handleRepair = async () => {
    setLoading(true);
    const res = await syncExistingInvoices();
    setLoading(false);

    if (res.success) {
      alert(`Successfully fixed ${res.count} old invoices!`);
    } else {
      alert(res.error || "Failed to sync.");
    }
  };

  return (
    <Button 
      onClick={handleRepair} 
      disabled={loading}
      variant="outline" 
      className="gap-2"
    >
      <RefreshCcw className={loading ? "animate-spin" : ""} size={16} />
      {loading ? "Fixing..." : "Sync Old Invoices"}
    </Button>
  );
}