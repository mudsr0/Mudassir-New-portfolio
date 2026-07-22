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

  // Navbar background change on scroll
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Track active section and clear active state if section is unlisted or out of view
  useEffect(() => {
    const visibleSections = new Map()

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleSections.set(entry.target.id, entry.intersectionRatio)
          } else {
            visibleSections.delete(entry.target.id)
          }
        })

        let currentId = null
        let maxRatio = -1

        visibleSections.forEach((ratio, id) => {
          if (ratio > maxRatio) {
            maxRatio = ratio
            currentId = id
          }
        })

        // Set active link only if current section exists in navbar links
        if (currentId && links.includes(currentId)) {
          setActiveLink(currentId)
        } else {
          setActiveLink(null)
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.1, 0.5, 1] }
    )

    // Observe all page sections with an id attribute
    const sections = document.querySelectorAll('section[id], div[id]')
    sections.forEach((el) => {
      if (el.id) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [links])

  // Move floating highlight pill to hovered or active link
  const movePillTo = (target) => {
    const el = target ? linkRefs.current[target] : null
    const parent = navLinksRef.current

    if (!menuOpen || !el || !parent) {
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

  // Update pill position when state changes
  useEffect(() => {
    const timeout = setTimeout(() => {
      movePillTo(hoveredLink ?? activeLink)
    }, 50)
    return () => clearTimeout(timeout)
  }, [hoveredLink, activeLink, menuOpen])

  // Recompute pill position on window resize
  useEffect(() => {
    const onResize = () => movePillTo(hoveredLink ?? activeLink)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [hoveredLink, activeLink, menuOpen])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="main navigation">
      
      {/* Left side: Toggle button and Dynamic Capsule */}
      <div className="nav-left-group">
        <button 
          className="pill-toggle" 
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Toggle Navigation"
        >
          {menuOpen ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="5" cy="12" r="2"></circle>
              <circle cx="12" cy="12" r="2"></circle>
              <circle cx="19" cy="12" r="2"></circle>
            </svg>
          )}
        </button>

        <div className={`dynamic-capsule ${menuOpen ? 'is-open' : 'is-closed'}`}>
          
          {/* Logo View */}
          <div className="capsule-logo" aria-hidden={menuOpen}>
            <div className="logo-circle">
              <div className="logo-dot" />
            </div>
            <span>{data.nav.logoText}</span>
          </div>

          {/* Links View */}
          <div
            className="capsule-links"
            ref={navLinksRef}
            onMouseLeave={() => setHoveredLink(null)}
            aria-hidden={!menuOpen}
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
                tabIndex={menuOpen ? 0 : -1}
              >
                {l}
              </button>
            ))}
          </div>

        </div>
      </div>

      {/* Right side */}
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