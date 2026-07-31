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

        if (currentId && links.includes(currentId)) {
          setActiveLink(currentId)
        } else {
          setActiveLink(null)
        }
      },
      { rootMargin: '-45% 0px -50% 0px', threshold: [0, 0.1, 0.5, 1] }
    )

    const sections = document.querySelectorAll('section[id], div[id]')
    sections.forEach((el) => {
      if (el.id) observer.observe(el)
    })

    return () => observer.disconnect()
  }, [links])

  // Move floating highlight pill to hovered or active link (Desktop only)
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

  useEffect(() => {
    const timeout = setTimeout(() => {
      movePillTo(hoveredLink ?? activeLink)
    }, 50)
    return () => clearTimeout(timeout)
  }, [hoveredLink, activeLink, menuOpen])

  useEffect(() => {
    const onResize = () => movePillTo(hoveredLink ?? activeLink)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [hoveredLink, activeLink, menuOpen])

  const scrollTo = (id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
    setMenuOpen(false)
  }

  return (
    <nav className={`navbar${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="main navigation">

      {/* Left side: Toggle button, Desktop Capsule, Mobile Logo Capsule, and Mobile Dropdown */}
      <div className="nav-left-group">
        <button
          className="pill-toggle"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-expanded={menuOpen}
          aria-label="Toggle Navigation"
        >
          {menuOpen ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="4" y1="6" x2="20" y2="6"></line>
              <line x1="4" y1="12" x2="20" y2="12"></line>
              <line x1="4" y1="18" x2="20" y2="18"></line>
            </svg>
          )}
        </button>

        {/* Desktop Dynamic Capsule */}
        <div className={`dynamic-capsule desktop-capsule ${menuOpen ? 'is-open' : 'is-closed'}`}>
          <div className="capsule-logo" aria-hidden={menuOpen}>
            <div className="logo-circle">
              <div className="logo-dot" />
            </div>
            <span>{data.nav.logoText}</span>
          </div>

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

        {/* Mobile Logo Capsule (Visible only on mobile when menu is closed) */}
        {!menuOpen && (
          <div className="mobile-logo-capsule">
            <div className="capsule-logo">
              <div className="logo-circle">
                <div className="logo-dot" />
              </div>
              <span>{data.nav.logoText}</span>
            </div>
          </div>
        )}

        {/* Mobile Dropdown Menu */}
        {menuOpen && (
          <div className="mobile-dropdown-menu">
            <div className="mobile-links-list">
              {links.map((l) => (
                <button
                  key={l}
                  className={`mobile-nav-link${activeLink === l ? ' active' : ''}`}
                  onClick={() => scrollTo(l)}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        )}
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