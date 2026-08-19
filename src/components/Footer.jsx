import data from '../data.json'
import Footer3DText from './common/Footer3DText'

export default function Footer() {
  const footer = data.footer
  const brand = footer.brand.slice(0, -1)

  return (
    <footer className="footer">
      <div className="footer-glow" aria-hidden="true"></div>

      <div className="footer-top" data-fade data-delay="0.2">
        <div className="footer-brand">
          <div className="footer-status">
            <span className="status-dot"></span>
            {footer.status}
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
              {brand}<span>.</span>
            </h2>
            <Footer3DText />
          </div>

          <p className="footer-tagline">
            {footer.tagline}
          </p>
        </div>

        <div className="footer-nav">
          <a
            href={footer.upworkUrl}
            className="footer-cta"
            target="_blank"
            rel="noopener noreferrer"
          >
            {footer.ctaText}
            <span aria-hidden="true">↗</span>
          </a>
        </div>
      </div>

      <div className="footer-divider"></div>

      <div className="footer-bottom">
        <span className="footer-copy">{footer.copyright}</span>
        <span className="footer-credits">{footer.services}</span>
      </div>
    </footer>
  )
}