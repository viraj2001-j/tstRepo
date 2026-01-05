"use client"
import { signIn } from "next-auth/react"
import { useState, useEffect, useRef } from "react"
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
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Particle system for floating invoices
    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      rotation: number
      rotationSpeed: number
      opacity: number
      type: 'invoice' | 'dollar' | 'chart' | 'check'
    }> = []

    // Initialize particles
    for (let i = 0; i < 25; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: 30 + Math.random() * 40,
        rotation: Math.random() * Math.PI * 2,
        rotationSpeed: (Math.random() - 0.5) * 0.02,
        opacity: 0.1 + Math.random() * 0.3,
        type: ['invoice', 'dollar', 'chart', 'check'][Math.floor(Math.random() * 4)] as any
      })
    }

    // Grid lines
    const gridLines: Array<{
      x1: number
      y1: number
      x2: number
      y2: number
      opacity: number
    }> = []

    for (let i = 0; i < 20; i++) {
      gridLines.push({
        x1: Math.random() * canvas.width,
        y1: Math.random() * canvas.height,
        x2: Math.random() * canvas.width,
        y2: Math.random() * canvas.height,
        opacity: 0.05 + Math.random() * 0.1
      })
    }

    let animationId: number
    let time = 0

    const drawIcon = (ctx: CanvasRenderingContext2D, type: string, x: number, y: number, size: number, rotation: number) => {
      ctx.save()
      ctx.translate(x, y)
      ctx.rotate(rotation)
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)'
      ctx.lineWidth = 2
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'

      const s = size / 2

      switch (type) {
        case 'invoice':
          // Document icon
          ctx.beginPath()
          ctx.moveTo(-s * 0.6, -s * 0.8)
          ctx.lineTo(s * 0.6, -s * 0.8)
          ctx.lineTo(s * 0.6, s * 0.8)
          ctx.lineTo(-s * 0.6, s * 0.8)
          ctx.closePath()
          ctx.stroke()
          // Lines
          ctx.beginPath()
          ctx.moveTo(-s * 0.4, -s * 0.4)
          ctx.lineTo(s * 0.4, -s * 0.4)
          ctx.moveTo(-s * 0.4, 0)
          ctx.lineTo(s * 0.4, 0)
          ctx.moveTo(-s * 0.4, s * 0.4)
          ctx.lineTo(s * 0.2, s * 0.4)
          ctx.stroke()
          break
        case 'dollar':
          // Dollar sign
          ctx.beginPath()
          ctx.arc(0, 0, s * 0.6, 0, Math.PI * 2)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(0, -s * 0.8)
          ctx.lineTo(0, s * 0.8)
          ctx.stroke()
          ctx.font = `${s * 1.2}px Arial`
          ctx.textAlign = 'center'
          ctx.textBaseline = 'middle'
          ctx.fillStyle = 'rgba(59, 130, 246, 0.3)'
          ctx.fillText('$', 0, 0)
          break
        case 'chart':
          // Bar chart
          ctx.beginPath()
          ctx.rect(-s * 0.6, s * 0.2, s * 0.3, -s * 0.5)
          ctx.rect(-s * 0.15, s * 0.2, s * 0.3, -s * 0.8)
          ctx.rect(s * 0.3, s * 0.2, s * 0.3, -s * 0.6)
          ctx.stroke()
          break
        case 'check':
          // Checkmark
          ctx.beginPath()
          ctx.arc(0, 0, s * 0.6, 0, Math.PI * 2)
          ctx.stroke()
          ctx.beginPath()
          ctx.moveTo(-s * 0.3, 0)
          ctx.lineTo(-s * 0.1, s * 0.2)
          ctx.lineTo(s * 0.3, -s * 0.3)
          ctx.stroke()
          break
      }

      ctx.restore()
    }

    const animate = () => {
      // Gradient background
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#0f172a')
      gradient.addColorStop(0.5, '#1e3a8a')
      gradient.addColorStop(1, '#312e81')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw grid lines with wave effect
      gridLines.forEach((line, i) => {
        const wave = Math.sin(time * 0.5 + i * 0.5) * 20
        ctx.strokeStyle = `rgba(59, 130, 246, ${line.opacity})`
        ctx.lineWidth = 1
        ctx.beginPath()
        ctx.moveTo(line.x1, line.y1 + wave)
        ctx.lineTo(line.x2, line.y2 + wave)
        ctx.stroke()
      })

      // Draw and update particles
      particles.forEach((p) => {
        // Mouse interaction
        const dx = mousePos.x - p.x
        const dy = mousePos.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150) {
          const force = (150 - dist) / 150
          p.vx -= (dx / dist) * force * 0.5
          p.vy -= (dy / dist) * force * 0.5
        }

        // Update position
        p.x += p.vx
        p.y += p.vy
        p.rotation += p.rotationSpeed

        // Damping
        p.vx *= 0.99
        p.vy *= 0.99

        // Boundary
        if (p.x < -50) p.x = canvas.width + 50
        if (p.x > canvas.width + 50) p.x = -50
        if (p.y < -50) p.y = canvas.height + 50
        if (p.y > canvas.height + 50) p.y = -50

        // Draw icon
        ctx.globalAlpha = p.opacity
        drawIcon(ctx, p.type, p.x, p.y, p.size, p.rotation)
        ctx.globalAlpha = 1
      })

      // Animated wave lines
      ctx.strokeStyle = 'rgba(139, 92, 246, 0.2)'
      ctx.lineWidth = 2
      for (let i = 0; i < 3; i++) {
        ctx.beginPath()
        for (let x = 0; x < canvas.width; x += 5) {
          const y = canvas.height / 2 + Math.sin((x + time * 50 + i * 100) * 0.01) * 50 + i * 80
          if (x === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        }
        ctx.stroke()
      }

      time += 1
      animationId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      })
    }

    window.addEventListener('resize', handleResize)
    canvas.addEventListener('mousemove', handleMouseMove)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', handleResize)
      canvas.removeEventListener('mousemove', handleMouseMove)
    }
  }, [mousePos.x, mousePos.y])

  async function submit() {
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
    const result = await signIn("credentials", {
      ...parsed.data,
      redirect: false,
    })
    setLoading(false)
    if (result?.error) {
      setErrors({
        general: "Invalid username or password",
      })
      return
    }
    router.push("/dashboard")
  }
  
  function onChange(
    e: ChangeEvent<HTMLInputElement>,
    field: "username" | "password"
  ) {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  return (
    <div className="flex min-h-screen relative overflow-hidden">
      {/* Full background canvas */}
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
      />

      {/* Overlay gradient for better readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30"></div>

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative z-10 p-12 flex-col justify-between">
        <div>
          {/* Floating logo card */}
          <div className="flex items-center gap-3 mb-8 backdrop-blur-xl bg-white/10 rounded-2xl p-4 w-fit border border-white/20 shadow-2xl hover:scale-105 transition-transform duration-300">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-bold text-white block">InvoiceHub</span>
              <span className="text-xs text-blue-200">Professional Edition</span>
            </div>
          </div>
          
          <div className="space-y-6 max-w-lg backdrop-blur-2xl bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-10 border border-white/20 shadow-2xl">
            <div className="inline-block px-4 py-2 bg-blue-500/20 rounded-full border border-blue-400/30 backdrop-blur-sm">
              <span className="text-blue-200 text-sm font-semibold">✨ Next-Gen Invoicing</span>
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight">
              Transform Your
              <span className="block mt-2 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Financial Workflow
              </span>
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed">
              Experience intelligent invoice management powered by modern technology. Create, track, and analyze with unprecedented ease.
            </p>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4">
          <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer group">
            <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform">99.9%</div>
            <div className="text-blue-200 text-sm mt-1">Uptime</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer group">
            <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform">50K+</div>
            <div className="text-blue-200 text-sm mt-1">Active Users</div>
          </div>
          <div className="backdrop-blur-xl bg-white/10 rounded-xl p-4 border border-white/20 hover:bg-white/20 transition-all cursor-pointer group">
            <div className="text-3xl font-bold text-white group-hover:scale-110 transition-transform">24/7</div>
            <div className="text-blue-200 text-sm mt-1">Support</div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-white">InvoiceHub</span>
          </div>

          <div className="backdrop-blur-2xl bg-white/95 rounded-3xl shadow-2xl p-8 border border-white/40">
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">Secure Access</h2>
              <p className="text-slate-600">Enter your credentials to continue</p>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="mb-6 bg-gradient-to-r from-red-50 to-pink-50 border-l-4 border-red-500 rounded-lg p-4 animate-shake shadow-sm">
                <div className="flex items-center gap-3 text-red-700">
                  <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium">{errors.general}</p>
                </div>
              </div>
            )}

            {/* Form */}
            <div className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Username
                </label>
                <div className="relative group">
                  <Input
                    placeholder="Enter your username"
                    value={form.username}
                    onChange={e => onChange(e, "username")}
                    className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl pl-4 transition-all duration-200 group-hover:border-slate-300"
                  />
                </div>
                {errors.username && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2 animate-slideDown">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.username}
                  </p>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-slate-700 flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    Password
                  </label>
                  <a href="#" className="text-xs font-semibold text-blue-600 hover:text-blue-700 transition-colors hover:underline">
                    Forgot Password?
                  </a>
                </div>
                <div className="relative group">
                  <Input
                    type="password"
                    placeholder="Enter your password"
                    value={form.password}
                    onChange={e => onChange(e, "password")}
                    className="h-12 border-2 border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 rounded-xl pl-4 transition-all duration-200 group-hover:border-slate-300"
                  />
                </div>
                {errors.password && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-2 animate-slideDown">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {errors.password}
                  </p>
                )}
              </div>

              <Button 
                className="w-full h-14 bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-size-200 hover:bg-pos-100 text-blue-600 font-bold rounded-xl shadow-lg hover:shadow-2xl hover:border-color-blue-600 transition-all duration-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]" 
                disabled={loading} 
                onClick={submit}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    Sign In Securely
                  </span>
                )}
              </Button>
            </div>

            {/* Footer */}
            <div className="mt-8 pt-6 border-t border-slate-200">
              <p className="text-center text-sm text-slate-600">
                New to InvoiceHub?{" "}
                <a href="#" className="font-bold text-blue-600 hover:text-blue-700 transition-colors hover:underline">
                  Request Access
                </a>
              </p>
            </div>
          </div>

          {/* Trust badges */}
          <div className="mt-6 flex items-center justify-center gap-6 flex-wrap">
            <div className="flex items-center gap-2 text-white/80 text-xs backdrop-blur-sm bg-white/10 px-3 py-2 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">256-bit SSL</span>
            </div>
            <div className="flex items-center gap-2 text-white/80 text-xs backdrop-blur-sm bg-white/10 px-3 py-2 rounded-full">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-semibold">SOC 2 Certified</span>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
        .bg-size-200 {
          background-size: 200% 100%;
        }
        .bg-pos-100 {
          background-position: 100% 0;
        }
      `}</style>
    </div>
  )
}