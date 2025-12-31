"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { loginSchema } from "@/lib/validators/auth"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { ZodIssue } from "zod"
import type { ChangeEvent } from "react"
import { useRouter } from "next/navigation"

type LoginErrors = {
  username?: string
  password?: string
  general?: string
}

export default function LoginPage() {
  const router = useRouter()

  const [form, setForm] = useState({ username: "", password: "" })
  const [errors, setErrors] = useState<LoginErrors>({})
  const [loading, setLoading] = useState(false)

  async function submit() {
    // Zod validation
    const parsed = loginSchema.safeParse(form)

    if (!parsed.success) {
      const fieldErrors: LoginErrors = {}

      parsed.error.issues.forEach((issue: ZodIssue) => {
        const field = issue.path[0] as keyof LoginErrors
        fieldErrors[field] = issue.message
      })

      setErrors(fieldErrors)
      return
    }

    setErrors({})
    setLoading(true)

    // 🔑 NextAuth login
    const result = await signIn("credentials", {
      ...parsed.data,
      redirect: false, // 🔴 REQUIRED
    })

    setLoading(false)

    // ❌ Invalid credentials
    if (result?.error) {
      setErrors({
        general: "Invalid username or password",
      })
      return
    }

    // ✅ Success
    router.push("/dashboard")
  }

  function onChange(
    e: ChangeEvent<HTMLInputElement>,
    field: "username" | "password"
  ) {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-80 space-y-4">
        {/* 🔴 General Error */}
        {errors.general && (
          <p className="text-sm text-red-500 text-center">
            {errors.general}
          </p>
        )}

        <div>
          <Input
            placeholder="Username"
            value={form.username}
            onChange={e => onChange(e, "username")}
          />
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username}</p>
          )}
        </div>

        <div>
          <Input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={e => onChange(e, "password")}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        <Button className="w-full" disabled={loading} onClick={submit}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </div>
    </div>
  )
}
