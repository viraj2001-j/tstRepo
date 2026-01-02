"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"

import {
  LayoutDashboard,
  FilePlus,
  FileText,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react"

type MenuItem = {
  label: string
  href: string
  icon: React.ReactNode
}

const menu: MenuItem[] = [
  {
    label: "Dashboard",
    href: "/superadmin",
    icon: <LayoutDashboard className="h-5 w-5" />,
  },
  {
    label: "Create Invoice",
    href: "/dashboard/invoices/new",
    icon: <FilePlus className="h-5 w-5" />,
  },
  {
    label: "View Invoices",
    href: "/dashboard/invoices/view",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    label: "Clients",
    href: "/superadmin/clients",
    icon: <Users className="h-5 w-5" />,
  },
  {
    label: "Reports & Analytics",
    href: "/superadmin/reports",
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    label: "Admin Settings",
    href: "/superadmin/settings",
    icon: <Settings className="h-5 w-5" />,
  },
]

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Mobile top bar */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-40 bg-gray-900 text-white flex items-center justify-between p-4">
        <span className="font-semibold">Super Admin</span>
        <button onClick={() => setMobileOpen(true)}>
          <Menu />
        </button>
      </div>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static z-50 h-screen bg-gray-900 text-white transition-all
        ${collapsed ? "w-16" : "w-64"}
        ${mobileOpen ? "left-0" : "-left-full"}
        md:left-0`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          {!collapsed && <span className="font-bold">Super Admin</span>}

          <div className="flex gap-2">
            {/* Desktop collapse */}
            <button
              className="hidden md:block"
              onClick={() => setCollapsed(!collapsed)}
            >
              <Menu />
            </button>

            {/* Mobile close */}
            <button className="md:hidden" onClick={() => setMobileOpen(false)}>
              <X />
            </button>
          </div>
        </div>

        {/* Menu */}
        <nav className="p-2 space-y-1">
          {menu.map(item => {
            const active = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded px-3 py-2 text-sm
                hover:bg-gray-800 transition
                ${active ? "bg-gray-800" : ""}`}
                onClick={() => setMobileOpen(false)}
              >
                {item.icon}
                {!collapsed && <span>{item.label}</span>}
              </Link>
            )
          })}

          {/* Logout */}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-3 w-full rounded px-3 py-2 text-sm hover:bg-red-600 mt-4"
          >
            <LogOut className="h-5 w-5" />
            {!collapsed && <span>Logout</span>}
          </button>
        </nav>
      </aside>
    </>
  )
}
