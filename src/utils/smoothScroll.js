// Centralized smooth scrolling.
// Prefers Lenis (exposed on window.lenis by App.jsx) so programmatic scrolls
// glide with the same animation and never fight Lenis's internal scroll state.
// Falls back to native smooth scrolling if Lenis isn't mounted yet.

const getLenis = () => (typeof window !== 'undefined' ? window.lenis : null)

/**
 * Smoothly scrolls to a target.
 * @param {number|string|HTMLElement} target  pixel offset, CSS selector, or element
 * @param {{ offset?: number, duration?: number }} [opts]
 */
export function smoothScrollTo(target, opts = {}) {
  const lenis = getLenis()
  const { offset = 0, duration = 3 } = opts

  if (lenis) {
    lenis.scrollTo(target, { offset, duration })
    return
  }

  if (typeof target === 'number') {
    window.scrollTo({ top: target, behavior: 'smooth' })
    return
  }

  const el = typeof target === 'string' ? document.querySelector(target) : target
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}