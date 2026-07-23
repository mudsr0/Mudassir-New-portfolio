import { useRef, useEffect, useState } from 'react'
import WaveBackground from './common/WaveBackground'
import data from '../data.json'

function useInView(ref) {
  const [inView, setInView] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); obs.disconnect() } },
      { threshold: 0.4 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [ref])
  return inView
}

function ServiceCard({ s }) {
  const cellRef = useRef(null)
  const numRef = useRef(null)
  const inView = useInView(cellRef)
  const [displayNum, setDisplayNum] = useState('00')

  useEffect(() => {
    if (!inView) return
    const target = parseInt(s.num, 10)
    let frame = 0
    const totalFrames = 20
    const interval = setInterval(() => {
      frame++
      const val = Math.min(target, Math.round((target * frame) / totalFrames))
      setDisplayNum(String(val).padStart(2, '0'))
      if (frame >= totalFrames) clearInterval(interval)
    }, 25)
    return () => clearInterval(interval)
  }, [inView, s.num])

  const handleMove = (e) => {
    const r = cellRef.current.getBoundingClientRect()
    const x = e.clientX - r.left
    const y = e.clientY - r.top

    cellRef.current.style.setProperty('--x', `${x}px`)
    cellRef.current.style.setProperty('--y', `${y}px`)
  }

  const handleLeave = () => {
    const arrow = cellRef.current.querySelector('.svc-arrow')
    if (arrow) arrow.style.transform = 'translate(0,0)'
  }

  return (
    <div
      ref={cellRef}
      className="svc-cell"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <div className="svc-spotlight" />

      <svg className="svc-wave" viewBox="0 0 300 100" preserveAspectRatio="none">
        <path fill="var(--accent)" opacity="0.08">
          <animate
            attributeName="d"
            dur="6s"
            repeatCount="indefinite"
            values="
              M0,60 Q75,30 150,60 T300,60 V100 H0 Z;
              M0,60 Q75,90 150,60 T300,60 V100 H0 Z;
              M0,60 Q75,30 150,60 T300,60 V100 H0 Z"
          />
        </path>
        <path fill="var(--accent)" opacity="0.05">
          <animate
            attributeName="d"
            dur="8s"
            repeatCount="indefinite"
            values="
              M0,70 Q75,50 150,70 T300,70 V100 H0 Z;
              M0,70 Q75,95 150,70 T300,70 V100 H0 Z;
              M0,70 Q75,50 150,70 T300,70 V100 H0 Z"
          />
        </path>
      </svg>

      <div className="svc-inner">
        <div ref={numRef} className="svc-num">{displayNum}</div>
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
    <section id="services" className="section">
      <WaveBackground color="#ffffff" dotCount={170} />

      <div className="sec-header" data-fade>
        <div className="sec-eyebrow">
          <span className="eyebrow-num">02</span>
          services
        </div>
        <h2 className="sec-h">What I build.</h2>
      </div>

      <div className="svc-grid-wrap">
        <div className="svc-grid" data-stagger>
          {services.map((s) => (
            <ServiceCard key={s.num} s={s} />
          ))}
        </div>
      </div>
    </section>
  )
}