import prisma from "@/lib/db"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import SignatureUpload from "./SignatureUpload"
import { redirect } from "next/navigation"
import Sidebar from "@/components/sidebar"

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const user = await prisma.user.findUnique({
    where: { id: parseInt(session.user.id) },
    select: { signature: true, username: true, role: true }
  })

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      
      <main className="flex-1 overflow-y-auto">
        {/* Changed max-w-5xl to w-full and added more padding for the "Wide" look */}
        <div className="p-4 md:p-10 w-full space-y-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-800 uppercase italic">
              Profile Settings
            </h1>
            <p className="text-slate-500 font-medium">
              Manage your official credentials and digital invoice signature.
            </p>
          </div>

          <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center gap-4 w-full">
            <div className="h-14 w-14 rounded-full bg-blue-600 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-blue-200">
              {user?.username?.[0].toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-xl text-slate-900">{user?.username}</p>
              <p className="text-[10px] uppercase font-black text-blue-500 tracking-[0.2em]">
                {user?.role} Account
              </p>
            </div>
          </div>

          <SignatureUpload initialSignature={user?.signature} />
        </div>
      </main>
    </div>
  )
}