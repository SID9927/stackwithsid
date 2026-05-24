'use client'

import { useEffect, useRef } from 'react'

export default function Confetti({ active = true }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (!active) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    let animationFrameId
    let width = (canvas.width = window.innerWidth)
    let height = (canvas.height = window.innerHeight)

    const colors = [
      '#7c3aed', // Purple
      '#10b981', // Emerald
      '#06b6d4', // Cyan
      '#f59e0b', // Amber
      '#ec4899', // Pink
      '#3b82f6', // Blue
    ]

    const particles = []
    const particleCount = 120
    let isSpawning = true

    class Particle {
      constructor() {
        this.x = Math.random() * width
        this.y = Math.random() * -100 - 20
        this.size = Math.random() * 6 + 4
        this.color = colors[Math.floor(Math.random() * colors.length)]
        this.speedX = Math.random() * 4 - 2
        this.speedY = Math.random() * 3 + 2
        this.rotation = Math.random() * 360
        this.rotationSpeed = Math.random() * 4 - 2
        this.opacity = 1
      }

      update() {
        this.x += this.speedX
        this.y += this.speedY
        this.rotation += this.rotationSpeed

        // Add a bit of horizontal wave sway
        this.speedX += Math.sin(this.y / 20) * 0.05

        // Slowly fade out as they reach the bottom half
        if (this.y > height * 0.7) {
          this.opacity -= 0.015
        }
      }

      draw() {
        ctx.save()
        ctx.translate(this.x, this.y)
        ctx.rotate((this.rotation * Math.PI) / 180)
        ctx.fillStyle = this.color
        ctx.globalAlpha = Math.max(0, this.opacity)
        
        // Draw rectangle particle
        ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size * 1.5)
        
        ctx.restore()
      }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
      setTimeout(() => {
        if (isSpawning) {
          particles.push(new Particle())
        }
      }, i * 35)
    }

    // Stop spawning after 3 seconds
    const stopTimeout = setTimeout(() => {
      isSpawning = false
    }, 3500)

    const resizeHandler = () => {
      if (!canvasRef.current) return
      width = canvasRef.current.width = window.innerWidth
      height = canvasRef.current.height = window.innerHeight
    }

    window.addEventListener('resize', resizeHandler)

    const tick = () => {
      ctx.clearRect(0, 0, width, height)

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i]
        p.update()
        p.draw()

        // Remove if off screen or fully transparent
        if (p.y > height || p.opacity <= 0) {
          particles.splice(i, 1)
        }
      }

      // Keep spawning new ones if still spawning and count is low
      if (isSpawning && particles.length < particleCount) {
        particles.push(new Particle())
      }

      if (particles.length > 0 || isSpawning) {
        animationFrameId = requestAnimationFrame(tick)
      } else {
        ctx.clearRect(0, 0, width, height)
      }
    }

    tick()

    return () => {
      cancelAnimationFrame(animationFrameId)
      clearTimeout(stopTimeout)
      window.removeEventListener('resize', resizeHandler)
    }
  }, [active])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        pointerEvents: 'none',
        zIndex: 9999, // Ensure it sits on top of everything
      }}
    />
  )
}
