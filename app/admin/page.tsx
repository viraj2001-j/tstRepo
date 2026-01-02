import { LogoutButton } from "@/components/logout-button"
import InventoryPage from "./inventory/page";
import Link from "next/link";
import Sidebar from "@/components/sidebar";

export default function AdminDashboard() {

  
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>
      <InventoryPage/>
      <LogoutButton />
      <Sidebar></Sidebar>

    <Link
  href="/dashboard/invoices/new"
  className="px-4 py-2 bg-blue-600 text-white rounded"
>
  Create Invoice
</Link>


   

  
    </div>
  )
}
