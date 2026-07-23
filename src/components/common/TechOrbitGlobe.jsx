import { useEffect, useMemo, useRef } from 'react'
import ParticleDome from './ParticleDome'

const ICON_MAP = {
  'React / Next.js': { slug: 'react', color: '61dafb' },
  'Three.js': { slug: 'threedotjs', color: 'ffffff' },
  'Node.js': { slug: 'nodedotjs', color: '5fa04e' },
  'Flutter': { slug: 'flutter', color: '02569b' },
  'OpenAI API': { slug: 'openai', color: '412991' },
  'Python': { slug: 'python', color: '3776ab' },
  'MongoDB': { slug: 'mongodb', color: '47a248' },
  'GSAP': { slug: 'greensock', color: '88ce02' },
  'Framer Motion': { slug: 'framer', color: '0055ff' },
  'GCP': { slug: 'googlecloud', color: '4285f4' },
  'n8n': { slug: 'n8n', color: 'ea4b71' },
  'Groq': { slug: 'groq', color: 'f55036' },
  'Vercel': { slug: 'vercel', color: 'ffffff' },
  'Tailwind CSS': { slug: 'tailwindcss', color: '06b6d4' },
  'TypeScript': { slug: 'typescript', color: '3178c6' },
  'FastAPI': { slug: 'fastapi', color: '009688' },
  'Twilio': { slug: 'twilio', color: 'f22f46' },
  'Zapier': { slug: 'zapier', color: 'ff4a00' },
  'Airtable (API)': { slug: 'airtable', color: '18bfff' },
  'Shopify': { slug: 'shopify', color: '95bf47' },
  'Neon DB': null,
  'GoHighLevel': null,
}

function TechIcon({ name, featured }) {
  const entry = ICON_MAP[name]
  const src = entry ? `https://cdn.simpleicons.org/${entry.slug}/${entry.color}` : null

  return (
    <div className={`tech-orbit-icon-wrap${featured ? ' featured' : ''}`} title={name}>
      {src ? (
        <img
          src={src}
          alt={name}
          className="tech-orbit-icon-img"
          onError={(e) => {
            e.target.style.display = 'none'
            const fallback = e.target.nextSibling
            if (fallback) fallback.style.display = 'flex'
          }}
        />
      ) : null}
      <span
        className="tech-orbit-icon-fallback"
        style={{ display: src ? 'none' : 'flex' }}
      >
        {name.charAt(0)}
      </span>
    </div>
  )
}

// radius (px) from the center point, and how long a full loop takes (seconds)
const RING_CONFIG = [
  { radius: 130, duration: 12 },
  { radius: 200, duration: 20 },
  { radius: 270, duration: 28 },
  { radius: 340, duration: 36 },
]

export default function TechOrbitGlobe({ items }) {
  const itemRefs = useRef([])

  // distribute items across rings, precompute each item's radius/speed/starting angle
  const positioned = useMemo(() => {
    const buckets = Array.from({ length: RING_CONFIG.length }, () => [])
    items.forEach((item, i) => buckets[i % RING_CONFIG.length].push(item))

    const flat = []
    buckets.forEach((ringItems, ringIndex) => {
      const { radius, duration } = RING_CONFIG[ringIndex]
      const dir = ringIndex % 2 === 0 ? 1 : -1
      const angleStep = (Math.PI * 2) / Math.max(ringItems.length, 1)
      ringItems.forEach((item, i) => {
        flat.push({
          item,
          radius,
          dir,
          speed: (Math.PI * 2) / duration, // radians per second
          baseAngle: angleStep * i,
        })
      })
    })
    return flat
  }, [items])

  itemRefs.current = []

  useEffect(() => {
    let frameId
    const start = performance.now()

    const animate = (now) => {
      const t = (now - start) / 1000
      positioned.forEach((p, idx) => {
        const angle = p.baseAngle + p.dir * p.speed * t
        const x = Math.cos(angle) * p.radius
        const y = Math.sin(angle) * p.radius
        const el = itemRefs.current[idx]
        if (el) el.style.transform = `translate(${x}px, ${y}px)`
      })
      frameId = requestAnimationFrame(animate)
    }
    frameId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(frameId)
  }, [positioned])

  return (
    <div className="tech-orbit-wrap">
      <div className="tech-orbit-dome">
        <ParticleDome size={280} />
      </div>

      {RING_CONFIG.map((r, i) => (
        <div
          key={i}
          className="tech-orbit-ring-outline"
          style={{ width: r.radius * 2, height: r.radius * 2 }}
        />
      ))}

      <div className="tech-orbit-center">
        {positioned.map((p, idx) => (
          <div
            key={p.item.name}
            className="tech-orbit-item"
            ref={(el) => (itemRefs.current[idx] = el)}
          >
            <TechIcon name={p.item.name} featured={p.item.featured} />
          </div>
        ))}
      </div>
    </div>
  )
}