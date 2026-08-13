import { useEffect } from 'react'

/**
 * Pauses CSS and SMIL animations when the observed element leaves the
 * viewport, and seamlessly resumes them when it re-enters, avoiding
 * off-screen CPU/GPU drain without any visual jump.
 *
 * - CSS marquees: toggles `is-paused` on the wrapper element so child
 *   tracks (via `animation-play-state: paused`) freeze in place.
 * - SMIL SVGs: calls `pauseAnimations()` / `unpauseAnimations()` on the
 *   observed element itself, which freezes the animation clock.
 */
export default function usePauseOnHidden(ref) {
  useEffect(() => {
    const el = ref.current
    if (!el) return

    const setPaused = (paused) => {
      el.classList.toggle('is-paused', paused)
      if (typeof el.pauseAnimations === 'function') {
        if (paused) el.pauseAnimations()
        else el.unpauseAnimations()
      }
    }

    const observer = new IntersectionObserver(([entry]) => {
      setPaused(!entry.isIntersecting)
    })

    observer.observe(el)
    return () => observer.disconnect()
  }, [ref])
}
