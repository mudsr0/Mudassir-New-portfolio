import { useEffect, useRef } from 'react'

const ROTATION_DIRECTION = 1, ROTATION_SPEED = 0.15, PARTICLE_COUNT = 2000

export default function ParticleDome({ size = 260 }) {
  const canvasRef = useRef(null), containerRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current, container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true })
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    const particles = new Array(PARTICLE_COUNT)
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2
      const r = Math.sqrt(Math.random())
      const radius = r * (size / 2.5)
      const heightFactor = Math.sqrt(Math.max(0, 1 - r * r))
      particles[i] = {
        baseAngle: theta, radius, baseY: -heightFactor * (size * 0.42),
        twinkle: Math.random() * Math.PI * 2, speed: 3 + Math.random() * 0.6, colorRoll: Math.random(),
      }
    }

    let frameId = null, visible = false, active = false

    const startAnimation = () => {
      if (active || !visible || document.hidden) return
      active = true
      frameId = requestAnimationFrame(animate)
    }

    const stopAnimation = () => {
      active = false
      if (frameId) { cancelAnimationFrame(frameId); frameId = null }
    }

    const animate = (time) => {
      if (!active || !visible || document.hidden) return
      ctx.clearRect(0, 0, size, size)
      const t = time * 0.001, cx = size / 2, cy = size * 0.60
      const rotationOffset = ROTATION_DIRECTION * ROTATION_SPEED * t

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i]
        const angle = p.baseAngle + rotationOffset
        const wobble = Math.sin(t * p.speed + p.twinkle) * 2
        const x = cx + Math.cos(angle) * p.radius
        const y = cy + p.baseY + wobble
        const alpha = 0.25 + 0.45 * ((Math.sin(t * p.speed + p.twinkle) + 1) / 2)

        if (p.colorRoll > 0.985) ctx.fillStyle = `rgba(0,180,90,${alpha})`
        else if (p.colorRoll > 0.975) ctx.fillStyle = `rgba(248,113,113,${alpha})`
        else if (p.colorRoll > 0.965) ctx.fillStyle = `rgba(251,191,36,${alpha})`
        else if (p.colorRoll > 0.9) ctx.fillStyle = `rgba(120,255,170,${alpha * 0.8})`
        else ctx.fillStyle = `rgba(255,255,255,${alpha})`

        ctx.fillRect(x, y, 1.6, 1.6)
      }
      frameId = requestAnimationFrame(animate)
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) startAnimation(); else stopAnimation()
    }, { threshold: 0, rootMargin: '150px' })
    observer.observe(container)

    const handleVisibilityChange = () => {
      if (document.hidden) stopAnimation()
      else if (visible) startAnimation()
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      stopAnimation()
      observer.disconnect()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [size])

  return (
    <div ref={containerRef}>
      <canvas ref={canvasRef} className="tech-dome-canvas" />
    </div>
  )
}