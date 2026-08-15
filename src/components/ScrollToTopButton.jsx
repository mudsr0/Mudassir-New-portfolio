import { useEffect, useState } from 'react'

const RADIUS = 22
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function ScrollToTopButton() {
  const [progress, setProgress] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let rafId = null

    const onScroll = () => {
      if (rafId != null) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        const scrollTop = window.scrollY
        const docHeight = document.documentElement.scrollHeight - window.innerHeight
        const pct = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0
        setProgress(pct)
        setVisible(scrollTop > 400)
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      if (rafId != null) cancelAnimationFrame(rafId)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const offset = CIRCUMFERENCE * (1 - progress)

  return (
    <button
      className={`scroll-top-btn${visible ? ' visible' : ''}`}
      onClick={scrollToTop}
      aria-label="Scroll back to top"
    >
      <svg className="scroll-top-ring" width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
        <circle className="scroll-top-ring-track" cx="24" cy="24" r={RADIUS} fill="none" strokeWidth="2" />
        <circle
          className="scroll-top-ring-progress"
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          strokeWidth="2"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          transform="rotate(-90 24 24)"
        />
      </svg>
      <span className="scroll-top-arrow" aria-hidden="true">↑</span>
    </button>
  )
}
