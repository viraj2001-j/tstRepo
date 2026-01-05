import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import CreateInvoiceUI from "./ui"; // We will rename your ui.tsx to this
import { redirect } from "next/navigation";
import Sidebar from "@/components/sidebar";

export default async function Page() {
  const session = await getServerSession(authOptions);

  // 🛡️ AUTHORIZATION: Allow both roles
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  
  if (!session || !session.user || !allowedRoles.includes(session.user.role)) {
    redirect("/login");
  }

  const userData = {
    username: (session.user as any).username||session.user.username||"User",
    role: session.user.role,
    id: session.user.id,
  };

return (
    <div className="flex min-h-screen bg-slate-50 overflow-hidden">
      {/* 🟢 Sidebar sits fixed/sticky on the left */}
      <Sidebar />
      
      {/* 🟢 Main scrolling area for the form */}
      <main className="flex-1 h-screen overflow-y-auto scroll-smooth">
         <CreateInvoiceUI user={userData} />
      </main>
    </div>
  )
}