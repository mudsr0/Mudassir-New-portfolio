import { useLayoutEffect } from 'react'
import { useLocation } from 'react-router-dom'

// Disable the browser's native scroll restoration (it jumps to the previous
// scroll position — e.g. the Work section — before React Router can reset it).
if ('scrollRestoration' in window.history) {
  window.history.scrollRestoration = 'manual'
}

export default function ScrollToTop() {
  const { pathname } = useLocation()

  useLayoutEffect(() => {
    // Runs synchronously before the browser paints, so the "back" navigation
    // never flashes the previously-scrolled position.
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}
