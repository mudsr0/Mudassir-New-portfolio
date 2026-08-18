import data from '../data.json'
import Footer3DText from './common/Footer3DText'

export default function Footer() {
  const links = data.footer.links
  const year = new Date().getFullYear()

  const toHref = (l) => {
    if (l.href.startsWith('mailto:')) {
      const email = l.href.slice('mailto:'.length)
      return `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`
    }
    return l.href
  }

  return (
    <footer className="footer">
      <div className="footer-glow" aria-hidden="true"></div>

      <div className="footer-top" data-fade data-delay="0.2">
        <div className="footer-brand">
          <div className="footer-status">
            <span className="status-dot"></span>
            Available for work
          </div>

          <div className="footer-logo-3d-wrapper">
            <h2
              className="footer-logo"
              style={{
                position: 'absolute',
                opacity: 0,
                pointerEvents: 'none',
              }}
            >
              Mudassir<span>.</span>
            </h2>
            <Footer3DText />
          </div>

          <p className="footer-tagline">
            Building premium digital experiences.
          </p>
        </div>

        <div className="footer-nav">
          <span className="footer-nav-label">Connect</span>
          <nav className="footer-links" aria-label="Social links">
            {links.map((l) => (
              <a
                key={l.label}
                href={toHref(l)}
                className="footer-link"
                target="_blank"
                rel="noopener noreferrer"
              >
                {l.label}
                <span className="link-arrow">↗</span>
              </a>
            ))}
          </nav>
        </div>
      </div>

      <div className="footer-divider"></div>

      <div className="footer-bottom">
        <span className="footer-copy">© {year} Mudassir H. · DevRolin</span>
        <span className="footer-credits">
          CRM Automation · Sales Systems · SaaS MVPs · Custom Platforms
        </span>
      </div>
    </footer>
  )
}