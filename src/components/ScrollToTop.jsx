import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Disable the browser's native scroll restoration (it jumps to the previous
// scroll position e.g. the Work section before React Router can reset it).
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    // Wipe any scroll positions GSAP ScrollTrigger is holding onto so it can't
    // fight the reset below.
    ScrollTrigger.clearScrollMemory()
    // Runs synchronously before the browser paints, so the "back" navigation
    // never flashes the previously-scrolled position.
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
