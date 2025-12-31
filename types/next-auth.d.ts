import NextAuth from "next-auth"
import { JWT } from "next-auth/jwt"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      username: string
      role: "ADMIN" | "SUPERADMIN"
    }
  }

  interface User {
    id: string
    username: string
    role: "ADMIN" | "SUPERADMIN"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "ADMIN" | "SUPERADMIN"
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string        // Add this
    username: string  // Add this
    role?: "ADMIN" | "SUPERADMIN"
  }
}