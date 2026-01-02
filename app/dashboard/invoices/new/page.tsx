import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import CreateInvoiceUI from "./ui"; // We will rename your ui.tsx to this
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getServerSession(authOptions);

  // 🛡️ AUTHORIZATION: Allow both roles
  const allowedRoles = ["SUPERADMIN", "ADMIN"];
  
  if (!session || !session.user || !allowedRoles.includes(session.user.role)) {
    redirect("/login");
  }

  const userData = {
    username: session.user.username,
    role: session.user.role,
    id: session.user.id,
  };

  return <CreateInvoiceUI user={userData} />;
}