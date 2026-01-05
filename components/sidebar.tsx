"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut, useSession } from "next-auth/react"

import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu as MenuIcon,
  X,
} from "lucide-react"

// 🟢 1. Define types to avoid "any" errors
type MenuItem = {
  label: string
  href: string
  icon: React.ReactNode
 superAdminOnly?: boolean // Visible only to SUPERADMIN
  adminOnly?: boolean
}


// 🟢 2. Define menu array outside the component
const menu: MenuItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard size={20} /> },
  { label: "Create Invoice", href: "/dashboard/invoices/new", icon: <FilePlus size={20} /> },
  { label: "View Invoices", href: "/dashboard/invoices/view", icon: <FileText size={20} /> },
  { label: "Clients", href: "", icon: <Users size={20} /> },
  { label: "Reports & Analytics", href: "/dashboard/invoices/reports", icon: <BarChart3 size={20} />},
  { label: "Admin Settings", href: "/superadmin/settings", icon: <Settings size={20} />,superAdminOnly: true },
  { label: "Signature", href: "/dashboard/invoices/addsignature", icon: <Settings size={20} />,superAdminOnly: true},
   { label: "Payment(CURD)", href: "/dashboard/invoices/payment", icon: <Settings size={20} /> },
     { label: "Send Message", href: "/settings", icon: <Settings size={20} /> },
   
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()
  
  // 🟢 3. useSession now works because it's inside <SessionProvider> in layout.tsx
  const { data: session } = useSession()

  // 🟢 4. Dynamic User Data logic
  const userName = (session?.user as any)?.username || session?.user?.name || "User"
  const userRole = (session?.user as any)?.role || "ADMIN"
  const isSuperAdmin = userRole === "SUPERADMIN"

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-blue-950 text-white flex items-center justify-between p-4">
        <span className="font-bold tracking-tight uppercase text-xs italic">
        <span className="text-blue-400">.</span> {userRole}
        </span>
        <button onClick={() => setMobileOpen(true)}>
          <MenuIcon />
        </button>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen bg-blue-900 text-white transition-all duration-300 flex flex-col
        ${collapsed ? "w-20" : "w-64"}
        ${mobileOpen ? "left-0" : "-left-full"}
        md:left-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-blue-800/50">
          {!collapsed && (
            <div className="flex flex-col">
                <span className="font-black text-xl tracking-tighter uppercase italic">
                    LUCIFER<span className="text-blue-400">.</span>
                </span>
                <span className="text-[10px] text-blue-300 font-bold uppercase tracking-widest leading-none">
                    {userRole === "SUPERADMIN" ? "Super Admin" : "Administrator"}
                </span>
            </div>
          )}

          <button
            className="p-1 hover:bg-blue-800 rounded transition-colors hidden md:block"
            onClick={() => setCollapsed(!collapsed)}
          >
            <MenuIcon size={20} />
          </button>
          <button className="md:hidden" onClick={() => setMobileOpen(false)}>
            <X size={20} />
          </button>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {menu.map((item: MenuItem) => {
            // Role-based filtering
            if (item.superAdminOnly && !isSuperAdmin) return null

            const active = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-bold transition-all
                ${active 
                  ? "bg-blue-800 text-white shadow-lg shadow-black/20" 
                  : "text-blue-100 hover:bg-blue-800/50 hover:text-white"
                }`}
                onClick={() => setMobileOpen(false)}
              >
                <span className={`${active ? "text-blue-300" : "text-blue-400"}`}>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* User Footer Section */}
        <div className="p-4 border-t border-blue-800/50 bg-blue-950/30">
          {!collapsed && (
            <div className="flex items-center gap-3 px-2 py-3 mb-2">
              <div className="h-9 w-9 rounded-full bg-blue-500 border-2 border-blue-400 flex items-center justify-center font-black text-xs shadow-md">
                {userName[0].toUpperCase()}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold truncate leading-none">{userName}</span>
                <span className="text-[9px] text-blue-400 uppercase font-black tracking-widest mt-1">Status: Online</span>
              </div>
            </div>
          )}

          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className={`flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm font-bold transition-colors
            text-red-300 hover:bg-red-600 hover:text-white`}
          >
            <LogOut size={20} />
            {!collapsed && <span>Log Out</span>}
          </button>
        </div>
      </aside>
    </>
  )
}