"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"


type Errors = {
  username?: string
  password?: string
  role?: string
  general?: string
}

type Issue = {
  path: (string | number)[]
  message: string
}

export default function SignupPage() {
  const [form, setForm] = useState({
    username: "",
    password: "",
    role: "ADMIN" as "ADMIN" | "SUPERADMIN",
  })

  const [errors, setErrors] = useState<Errors>({})
  const [loading, setLoading] = useState(false)
  const router = useRouter()


  async function submit() {
  setErrors({})
  setLoading(true)

  const res = await fetch("/api/signup", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  })

  const data: { issues?: Issue[]; error?: string } = await res.json()

  if (!res.ok) {
    if (data.issues) {
      const fieldErrors: Errors = {}

      data.issues.forEach(issue => {
        const field = issue.path[0]
        if (field === "username" || field === "password" || field === "role") {
          fieldErrors[field] = issue.message
        }
      })

      setErrors(fieldErrors)
    } else {
      setErrors({ general: data.error ?? "Something went wrong" })
    }

    setLoading(false)
    return
  }

  alert("Signup successful! Please login.")
  router.push("/login")
  setLoading(false)
}


  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-80 space-y-4">
        {errors.general && (
          <p className="text-sm text-red-500">{errors.general}</p>
        )}

        <div>
          <Input
            placeholder="Username"
            value={form.username}
            onChange={e => setForm({ ...form, username: e.target.value })}
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
            onChange={e => setForm({ ...form, password: e.target.value })}
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        <div>
          <select
            className="w-full border p-2 rounded"
            value={form.role}
            onChange={e =>
              setForm({
                ...form,
                role: e.target.value as "ADMIN" | "SUPERADMIN",
              })
            }
          >
            <option value="ADMIN">Admin</option>
            <option value="SUPERADMIN">Super Admin</option>
          </select>
          {errors.role && (
            <p className="text-sm text-red-500">{errors.role}</p>
          )}
        </div>

        <Button className="w-full" disabled={loading} onClick={submit}>
          {loading ? "Creating..." : "Sign Up"}
        </Button>
      </div>
    </div>
  )
}
