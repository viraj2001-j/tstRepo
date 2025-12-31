import NextAuth, { type NextAuthOptions } from "next-auth"
import Credentials from "next-auth/providers/credentials"
import  prisma from "@/lib/db"
import bcrypt from "bcrypt"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },

  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        username: { label: "Username", type: "text" },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials) return null

        const user = await prisma.user.findUnique({
          where: { username: credentials.username },
        })

        if (!user) return null

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isValid) return null

        return {
          id: user.id.toString(),
          username: user.username,
          role: user.role,
        }
      },
    }),
  ],

callbacks: {
  async jwt({ token, user }) {
    // When the user first logs in, 'user' contains the data from your authorize function
    if (user) {
      token.id = user.id
      token.username = user.username
      token.role = user.role
    }
    return token
  },

  async session({ session, token }) {
    // Now we take that data out of the token and put it into the session object
    if (session.user) {
      session.user.id = token.id as string
      session.user.username = token.username as string
      session.user.role = token.role as "ADMIN" | "SUPERADMIN"
    }
    return session
  },
},


  pages: {
    signIn: "/login",
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
