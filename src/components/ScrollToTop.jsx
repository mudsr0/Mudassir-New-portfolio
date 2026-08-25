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
    // Tell the browser NOT to restore the old scroll position. (Redundant with
    // the module-level guard below, but kept here for clarity on each nav.)
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual'
    }

    // Wipe any scroll positions GSAP ScrollTrigger is holding onto so it can't
    // fight the reset below.
    ScrollTrigger.clearScrollMemory()

    // Runs synchronously before the browser paints, so the "back" navigation
    // never flashes the previously-scrolled position.
    // Lenis intercepts native window.scrollTo, so jump via Lenis when available.
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true })
    } else {
      window.scrollTo(0, 0)
    }
  }, [pathname])

  return null
}
