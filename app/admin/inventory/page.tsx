import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  // 1. Fetch session on the SERVER
  const session = await getServerSession(authOptions);

  // 2. Immediate Server-Side Redirect
  // The browser never even downloads the HTML below if this fails
  if (!session) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "SUPERADMIN") {
    redirect("/dashboard");
  }

  return (
    <main>
      <h1>Secure Admin Area</h1>
      <p>Welcome, {session.user.username}.,,,,user id {session.user.id}.,,,,, user role{session.user.role}.
         This HTML only exists on the server until authorized.</p>
    </main>
  );
}