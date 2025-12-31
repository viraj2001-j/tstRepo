import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function SuperAdminPage() {
  // 1. Fetch session on the SERVER before rendering starts
  const session = await getServerSession(authOptions)

  // 2. 🛡️ HARD SECURITY CHECK
  // This happens before any HTML is sent to the browser.
  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "SUPERADMIN") {
    // Redirect unauthorized Admins to their own dashboard
    redirect("/dashboard")
  }

  // 3. Authorized Content
  // Since this is a Server Component, we don't need "use client" or useSession()+
  return (
    <div className="p-8 space-y-4">
      <div className="border-b pb-4">
        <h1 className="text-2xl font-bold text-red-600">System Settings</h1>
        <p className="text-gray-500">
          Authenticated as: <strong>{session.user.username}
          id: <strong>{session.user.id}</strong>
          role<strong>{session.user.role}     </strong>
          

          </strong>
        </p>
        <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded mt-2 inline-block">
          Access Level: {session.user.role}
        </span>
      </div>

      <div className="bg-red-50 p-6 rounded-lg border border-red-200">
        <p className="text-red-800 font-medium">Critical System Controls</p>
        <p className="text-sm text-red-600">
          Only users with SUPERADMIN privileges can see this section. 
          This content was verified on the server.
        </p>
      </div>
      
      {/* Example: Sensitive System Data can be fetched here directly via Prisma */}
    </div>
  )
}