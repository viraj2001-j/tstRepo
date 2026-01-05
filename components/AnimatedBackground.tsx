"use client"
import { useEffect, useRef, useState } from "react"

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas dimensions
    const setCanvasSize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    setCanvasSize()

    // Particle system for floating icons
    const particles: Array<{
      x: number; y: number; vx: number; vy: number;
      size: number; rotation: number; rotationSpeed: number;
      opacity: number; type: 'invoice' | 'dollar' | 'chart' | 'check'
    }> = []

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

    const gridLines: Array<{ x1: number; y1: number; x2: number; y2: number; opacity: number }> = []
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
      const s = size / 2

      ctx.beginPath()
      switch (type) {
        case 'invoice':
          ctx.rect(-s * 0.6, -s * 0.8, s * 1.2, s * 1.6)
          ctx.moveTo(-s * 0.4, -s * 0.4); ctx.lineTo(s * 0.4, -s * 0.4)
          ctx.moveTo(-s * 0.4, 0); ctx.lineTo(s * 0.4, 0)
          break
        case 'dollar':
          ctx.arc(0, 0, s * 0.6, 0, Math.PI * 2)
          ctx.font = `${s * 1.2}px Arial`
          ctx.fillStyle = 'rgba(59, 130, 246, 0.3)'
          ctx.fillText('$', -s * 0.3, s * 0.4)
          break
        case 'chart':
          ctx.rect(-s * 0.6, s * 0.2, s * 0.3, -s * 0.5)
          ctx.rect(-s * 0.15, s * 0.2, s * 0.3, -s * 0.8)
          ctx.rect(s * 0.3, s * 0.2, s * 0.3, -s * 0.6)
          break
        case 'check':
          ctx.arc(0, 0, s * 0.6, 0, Math.PI * 2)
          ctx.moveTo(-s * 0.3, 0); ctx.lineTo(-s * 0.1, s * 0.2); ctx.lineTo(s * 0.3, -s * 0.3)
          break
      }
      ctx.stroke()
      ctx.restore()
    }

    const animate = () => {
      // 1. Background Gradient
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
      gradient.addColorStop(0, '#0f172a')
      gradient.addColorStop(0.5, '#1e3a8a')
      gradient.addColorStop(1, '#312e81')
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // 2. Wave Grid
      gridLines.forEach((line, i) => {
        const wave = Math.sin(time * 0.5 + i * 0.5) * 20
        ctx.strokeStyle = `rgba(59, 130, 246, ${line.opacity})`
        ctx.beginPath()
        ctx.moveTo(line.x1, line.y1 + wave)
        ctx.lineTo(line.x2, line.y2 + wave)
        ctx.stroke()
      })

      // 3. Particles & Mouse Interaction
      particles.forEach((p) => {
        const dx = mousePos.x - p.x
        const dy = mousePos.y - p.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        if (dist < 150) {
          const force = (150 - dist) / 150
          p.vx -= (dx / dist) * force * 0.5
          p.vy -= (dy / dist) * force * 0.5
        }
        p.x += p.vx; p.y += p.vy; p.rotation += p.rotationSpeed
        p.vx *= 0.99; p.vy *= 0.99

        if (p.x < -50) p.x = canvas.width + 50
        if (p.x > canvas.width + 50) p.x = -50
        if (p.y < -50) p.y = canvas.height + 50
        if (p.y > canvas.height + 50) p.y = -50

        ctx.globalAlpha = p.opacity
        drawIcon(ctx, p.type, p.x, p.y, p.size, p.rotation)
        ctx.globalAlpha = 1
      })

      // 4. Center Wave Lines
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

    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener('resize', setCanvasSize)
    window.addEventListener('mousemove', handleMouseMove)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener('resize', setCanvasSize)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [mousePos.x, mousePos.y])

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
      <div className="absolute inset-0 bg-gradient-to-br from-black/20 via-transparent to-black/30" />
    </div>
  )
}