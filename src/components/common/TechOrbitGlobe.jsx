import { useEffect, useMemo, useRef } from 'react'
import ParticleDome from './ParticleDome'

const ICON_MAP = {
  'React / Next.js': { slug: 'react', color: '61dafb' }, 'Three.js': { slug: 'threedotjs', color: 'ffffff' },
  'Node.js': { slug: 'nodedotjs', color: '5fa04e' }, 'Flutter': { slug: 'flutter', color: '02569b' },
  'MongoDB': { slug: 'mongodb', color: '47a248' }, 'GSAP': { slug: 'greensock', color: '88ce02' },
  'Framer Motion': { slug: 'framer', color: '0055ff' }, 'GCP': { slug: 'googlecloud', color: '4285f4' },
  'Vercel': { slug: 'vercel', color: 'ffffff' }, 'Tailwind CSS': { slug: 'tailwindcss', color: '06b6d4' },
  'TypeScript': { slug: 'typescript', color: '3178c6' }, 'FastAPI': { slug: 'fastapi', color: '009688' },
  'Airtable (API)': { slug: 'airtable', color: '18bfff' }, 'Shopify': { slug: 'shopify', color: '95bf47' },
  'Neon DB': null, 'GoHighLevel': null,
}

const RING_CONFIG = [
  { radius: 130, duration: 12 }, { radius: 200, duration: 20 },
  { radius: 270, duration: 28 }, { radius: 340, duration: 36 },
]

function TechIcon({ name, featured }) {
  const entry = ICON_MAP[name]
  const src = entry ? `https://cdn.simpleicons.org/${entry.slug}/${entry.color}` : null

  return (
    <div className={`tech-orbit-icon-wrap${featured ? ' featured' : ''}`} title={name}>
      {src && (
        <img
          src={src} alt={name} className="tech-orbit-icon-img" loading="lazy" decoding="async"
          onError={(e) => {
            e.currentTarget.style.display = 'none'
            const fallback = e.currentTarget.nextElementSibling
            if (fallback) fallback.style.display = 'flex'
          }}
        />
      )}
      <span className="tech-orbit-icon-fallback" style={{ display: src ? 'none' : 'flex' }}>
        {name.charAt(0)}
      </span>
    </div>
  )
}

export default function TechOrbitGlobe({ items }) {
  const wrapperRef = useRef(null)
  const itemRefs = useRef([])

  const positioned = useMemo(() => {
    const buckets = Array.from({ length: RING_CONFIG.length }, () => [])
    items.forEach((item, index) => buckets[index % RING_CONFIG.length].push(item))
    
    const result = []
    buckets.forEach((ringItems, ringIndex) => {
      const { radius, duration } = RING_CONFIG[ringIndex]
      const direction = ringIndex % 2 === 0 ? 1 : -1
      const angleStep = (Math.PI * 2) / Math.max(ringItems.length, 1)
      
      ringItems.forEach((item, index) => {
        result.push({
          item, radius, direction, speed: (Math.PI * 2) / duration, baseAngle: angleStep * index,
        })
      })
    })
    return result
  }, [items])

  useEffect(() => {
    const wrapper = wrapperRef.current
    if (!wrapper || !positioned.length) return

    let frameId = null, startTime = 0, active = false, visible = false

    const updateVisibility = (isVisible) => {
      visible = isVisible
      if (visible && !active && !document.hidden) {
        active = true
        startTime = performance.now()
        frameId = requestAnimationFrame(animate)
      } else if ((!visible || document.hidden) && active) {
        active = false
        if (frameId) { cancelAnimationFrame(frameId); frameId = null }
      }
    }

    const animate = (now) => {
      if (!active || !visible || document.hidden) return
      const elapsed = (now - startTime) / 1000

      for (let i = 0; i < positioned.length; i++) {
        const item = positioned[i]
        const angle = item.baseAngle + item.direction * item.speed * elapsed
        const x = Math.cos(angle) * item.radius
        const y = Math.sin(angle) * item.radius
        const element = itemRefs.current[i]
        if (element) element.style.transform = `translate3d(${x}px, ${y}px, 0)`
      }
      frameId = requestAnimationFrame(animate)
    }

    const observer = new IntersectionObserver(([entry]) => updateVisibility(entry.isIntersecting), {
      threshold: 0, rootMargin: '150px',
    })
    observer.observe(wrapper)

    const handleVisibilityChange = () => updateVisibility(visible)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      active = false
      if (frameId) cancelAnimationFrame(frameId)
    }
  }, [positioned])

  return (
    <div ref={wrapperRef} className="tech-orbit-wrap">
      <div className="tech-orbit-dome">
        <ParticleDome size={280} />
      </div>
      {RING_CONFIG.map((ring, index) => (
        <div key={index} className="tech-orbit-ring-outline" style={{ width: ring.radius * 2, height: ring.radius * 2 }} />
      ))}
      <div className="tech-orbit-center">
        {positioned.map((item, index) => (
          <div
            key={item.item.name} className="tech-orbit-item" ref={(element) => { itemRefs.current[index] = element }}
          >
            <TechIcon name={item.item.name} featured={item.item.featured} />
          </div>
        ))}
      </div>
    </div>
  )
}