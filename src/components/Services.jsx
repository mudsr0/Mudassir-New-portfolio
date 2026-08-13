import { useRef, useEffect, useState } from 'react'
import WaveBackground from './common/WaveBackground'
import usePauseOnHidden from '../hooks/usePauseOnHidden'
import data from '../data.json'

function useInView(ref) {
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true)
          observer.disconnect()
        }
      },
      { threshold: 0.4 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return inView
}

/* ─────────────────────────────────────────────────────────────
   Service Card
   ───────────────────────────────────────────────────────────── */
function ServiceCard({ s }) {
  const cellRef = useRef(null), numRef = useRef(null), waveRef = useRef(null)
  const inView = useInView(cellRef)

  usePauseOnHidden(waveRef)

  useEffect(() => {
    if (!inView || !numRef.current) return

    const target = parseInt(s.num, 10)

    if (!Number.isFinite(target)) {
      numRef.current.textContent = '00'
      return
    }

    let frame = 0
    const totalFrames = 20
    let rafId = null

    const animateNumber = () => {
      frame++
      const progress = Math.min(frame / totalFrames, 1)
      const value = Math.min(target, Math.round(target * progress))

      if (numRef.current) {
        numRef.current.textContent = String(value).padStart(2, '0')
      }

      if (frame < totalFrames) {
        rafId = requestAnimationFrame(animateNumber)
      }
    }

    rafId = requestAnimationFrame(animateNumber)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [inView, s.num])


  const handleMove = (e) => {
    const cell = cellRef.current
    if (!cell) return

    const rect = cell.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    cell.style.setProperty('--x', `${x}px`)
    cell.style.setProperty('--y', `${y}px`)
  }

  const handleLeave = () => {
    const cell = cellRef.current
    if (!cell) return

    const arrow = cell.querySelector('.svc-arrow')
    if (arrow) arrow.style.transform = 'translate(0,0)'
  }

  return (
    <div ref={cellRef} className="svc-cell" onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {/* Mouse-following spotlight */}
      <div className="svc-spotlight" aria-hidden="true" />

      {/* Existing animated SVG waves */}
      <svg ref={waveRef} className="svc-wave" viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true">
        <path fill="var(--accent)" opacity="0.08">
          <animate
            attributeName="d"
            dur="6s"
            repeatCount="indefinite"
            values="M0,60 Q75,30 150,60 T300,60 V100 H0 Z; M0,60 Q75,90 150,60 T300,60 V100 H0 Z; M0,60 Q75,30 150,60 T300,60 V100 H0 Z"
          />
        </path>
        <path fill="var(--accent)" opacity="0.05">
          <animate
            attributeName="d"
            dur="8s"
            repeatCount="indefinite"
            values="M0,70 Q75,50 150,70 T300,70 V100 H0 Z; M0,70 Q75,95 150,70 T300,70 V100 H0 Z; M0,70 Q75,50 150,70 T300,70 V100 H0 Z"
          />
        </path>
      </svg>

      <div className="svc-inner">
        <div ref={numRef} className="svc-num">00</div>
        <div className="svc-icon" aria-hidden="true">{s.icon}</div>
        <div className="svc-title">{s.title}</div>
        <div className="svc-desc">{s.desc}</div>
        <div className="svc-arrow" aria-hidden="true">→</div>
      </div>
    </div>
  )
}

export default function Services() {
  const services = data.services

  return (
    <>
      <section id="services" className="section">
        <WaveBackground color="#ffffff" dotCount={170} />

        <div className="sec-header" data-fade>
          <div className="sec-eyebrow">
            <span className="eyebrow-num">01</span>
            services
          </div>
          <h2 className="sec-h">What I build.</h2>
        </div>

        {/* Mobile swipe hint (hidden on desktop via CSS) */}
        <div className="svc-mobile-hint" style={{ display: 'none' }}>
          ← Swipe to explore →
        </div>

        <div className="svc-grid-wrap">
          <div className="svc-grid" data-stagger>
            {services.map((s) => <ServiceCard key={s.num} s={s} />)}
          </div>
        </div>
      </section>
    </>
  )
}