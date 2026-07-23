import { useRef, useEffect } from 'react'

// 1 = clockwise, -1 = counter-clockwise. Set ROTATION_SPEED to 0 to stop spinning entirely.
const ROTATION_DIRECTION = 1
const ROTATION_SPEED = 0.15 

export default function ParticleDome({ size = 260 }) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const dpr = Math.min(window.devicePixelRatio, 2)

    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    // generate dome particles once: points on a hemisphere surface
    const PARTICLE_COUNT = 2000
    const particles = []
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const theta = Math.random() * Math.PI * 2
      const r = Math.pow(Math.random(), 0.5) // denser toward edge
      const radius = r * (size / 2.5)
      const heightFactor = Math.sqrt(Math.max(0, 1 - r * r)) // dome curvature
      particles.push({
        baseAngle: theta, // fixed starting angle, rotation offset added at render time
        radius,
        baseY: -heightFactor * (size * 0.42),
        twinkle: Math.random() * Math.PI * 2,
        speed: 3 + Math.random() * 0.6,
        colorRoll: Math.random(),
      })
    }

    let frameId
    const animate = (time) => {
      ctx.clearRect(0, 0, size, size)
      const t = time * 0.001
      const cx = size / 2
      const cy = size * 0.60 // dome base sits low, mostly cropped by parent overflow

      const rotationOffset = ROTATION_DIRECTION * ROTATION_SPEED * t

      for (const p of particles) {
        const angle = p.baseAngle + rotationOffset
        const wobble = Math.sin(t * p.speed + p.twinkle) * 2
        const x = cx + Math.cos(angle) * p.radius
        const y = cy + p.baseY + wobble
        const alpha = 0.25 + 0.45 * ((Math.sin(t * p.speed + p.twinkle) + 1) / 2)

        let color = `rgba(255,255,255,${alpha})`
        if (p.colorRoll > 0.985) color = `rgba(96, 165, 250, ${alpha})`
        else if (p.colorRoll > 0.975) color = `rgba(248, 113, 113, ${alpha})`
        else if (p.colorRoll > 0.965) color = `rgba(251, 191, 36, ${alpha})`
        else if (p.colorRoll > 0.9) color = `rgba(147, 197, 253, ${alpha * 0.8})`

        ctx.fillStyle = color
        ctx.fillRect(x, y, 1.6, 1.6)
      }

      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frameId)
  }, [size])

  return <canvas ref={canvasRef} className="tech-dome-canvas" />
}