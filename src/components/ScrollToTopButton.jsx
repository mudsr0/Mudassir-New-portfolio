import { useEffect, useRef } from 'react'

const RADIUS = 22
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function ScrollToTopButton() {
  const buttonRef = useRef(null)
  const circleRef = useRef(null)

  useEffect(() => {
    let rafId = null

    const update = () => {
      rafId = null
      const scrollTop = window.scrollY
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
      const progress = scrollHeight > 0 ? Math.min(scrollTop / scrollHeight, 1) : 0

      if (circleRef.current) {
        const circumference = 2 * Math.PI * circleRef.current.r.baseVal.value
        circleRef.current.style.strokeDashoffset = `${circumference * (1 - progress)}`
      }

      if (buttonRef.current) {
        buttonRef.current.classList.toggle('visible', scrollTop > 400)
      }
    }

    const onScroll = () => {
      if (rafId != null) return
      rafId = requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll, { passive: true })
    onScroll()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafId != null) cancelAnimationFrame(rafId)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <button
      ref={buttonRef}
      className="scroll-top-btn"
      onClick={scrollToTop}
      aria-label="Scroll back to top"
    >
      <svg className="scroll-top-ring" width="48" height="48" viewBox="0 0 48 48" aria-hidden="true">
        <circle className="scroll-top-ring-track" cx="24" cy="24" r={RADIUS} fill="none" strokeWidth="2" />
        <circle
          ref={circleRef}
          className="scroll-top-ring-progress"
          cx="24"
          cy="24"
          r={RADIUS}
          fill="none"
          strokeWidth="2"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
        />
      </svg>
      <span className="scroll-top-arrow" aria-hidden="true">↑</span>
    </button>
  )
}
