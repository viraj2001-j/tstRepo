import Sidebar from "@/components/sidebar"
import { ReactNode } from "react"

export default function SuperAdminLayout({
  children,
}: {
  children: ReactNode
}) {
  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 bg-gray-100 min-h-screen p-6 pt-20 md:pt-6">
        {children}
      </main>
    </div>
  )
}
