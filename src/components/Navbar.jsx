import { useEffect, useState, useRef } from 'react'
import data from '../data.json'

export default function Navbar() {
  const links = data.nav.links
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [activeLink, setActiveLink] = useState(null)
  const [hoveredLink, setHoveredLink] = useState(null)
  const [pill, setPill] = useState({ opacity: 0, x: 0, w: 0 })

  const linkRefs = useRef({})
  const navLinksRef = useRef(null)

  // Existing: navbar background change on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Track which section is currently in view.
  // Uses a thin horizontal "active band" at ~45–50% of viewport height.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)
        if (visible[0]) setActiveLink(visible[0].target.id)
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.1, 0.5, 1] }
    )
    links.forEach((l) => {
      const el = document.getElementById(l)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [links])

  // Move the pill to the hovered link, otherwise to the active link.
  const movePillTo = (target) => {
    const el = target ? linkRefs.current[target] : null
    const parent = navLinksRef.current
    if (!el || !parent) {
      setPill((p) => ({ ...p, opacity: 0 }))
      return
    }
    const elRect = el.getBoundingClientRect()
    const parentRect = parent.getBoundingClientRect()
    setPill({
      opacity: 1,
      x: elRect.left - parentRect.left,
      w: elRect.width,
    })
  }

  useEffect(() => { movePillTo(hoveredLink ?? activeLink) }, [hoveredLink, activeLink])

  // Recompute pill position on resize (layout shifts change link offsets)
  useEffect(() => {
    const onResize = () => movePillTo(hoveredLink ?? activeLink)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [hoveredLink, activeLink])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="main navigation">
      <div className="nav-logo">
        <div className="logo-circle" aria-hidden="true">
          <div className="logo-dot" />
        </div>
        {data.nav.logoText}
      </div>

      <div
        className="nav-links"
        ref={navLinksRef}
        onMouseLeave={() => setHoveredLink(null)}
      >
        <span
          className="nav-pill"
          aria-hidden="true"
          style={{
            opacity: pill.opacity,
            transform: `translateX(${pill.x}px) translateY(-50%)`,
            width: pill.w,
          }}
        />
        {links.map((l) => (
          <button
            key={l}
            ref={(el) => { linkRefs.current[l] = el }}
            className={`nav-link${activeLink === l ? ' active' : ''}`}
            onMouseEnter={() => setHoveredLink(l)}
            onFocus={() => setHoveredLink(l)}
            onBlur={() => setHoveredLink(null)}
            onClick={() => scrollTo(l)}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="nav-right">
        <div className="avail">
          <span className="avail-dot" />
          available
        </div>
        <button className="nav-cta" onClick={() => scrollTo('contact')}>
          hire me ↗
        </button>
      </div>
    </nav>
  )
}
