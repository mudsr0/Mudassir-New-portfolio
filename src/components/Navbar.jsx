import { useEffect, useState } from 'react'
import data from '../data.json'

export default function Navbar() {
  const links = data.nav.links
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

      <div className="nav-links">
        {links.map((l) => (
          <button key={l} className="nav-link" onClick={() => scrollTo(l)}>
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
